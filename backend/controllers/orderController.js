
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { processPayment, verifyStripePayment } = require('../utils/paymentService');
const { generateOrderInvoice } = require('../utils/invoiceService');
const { sendOrderConfirmation } = require('../utils/emailService');

// Create Order and Initialize Stripe Payment
exports.createOrder = async (req, res) => {
  try {
    const { products, deliveryAddress } = req.body;
    const userId = req.user._id;
    let totalAmount = 0;

    for (const item of products) {
      let product = null;
      if (mongoose.isValidObjectId(item.productId)) {
        product = await Product.findById(item.productId);
      }

      if (!product) {
        const numericId = Number(item.productId);
        if (!Number.isNaN(numericId)) {
          product = await Product.findOne({ id: numericId });
        }
      }

      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      
      totalAmount += (product.price - (product.price * (product.discount / 100))) * item.quantity;
    }

    const order = new Order({
      userId,
      products,
      totalAmount,
      deliveryAddress,
      paymentStatus: 'pending',
      orderStatus: 'processing'
    });

    await order.save();

    // Process Stripe Payment
    const paymentResult = await processPayment({
      amount: totalAmount,
      orderId: order._id,
      customerEmail: req.user.email
    });

    order.paymentId = paymentResult.paymentId;
    await order.save();

    res.json({
      orderId: order._id,
      paymentUrl: paymentResult.paymentUrl,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle Stripe Payment Success Verification
exports.paymentSuccess = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    if (order.paymentStatus === 'success') {
      return res.json({ message: 'Order already confirmed.' });
    }

    // Verify Stripe Payment
    const verification = await verifyStripePayment(paymentId);
    if (!verification.success) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ error: 'Stripe payment not confirmed' });
    }

    // Update stock
    for (const item of order.products) {
      if (mongoose.isValidObjectId(item.productId)) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      } else {
        const numericId = Number(item.productId);
        if (!Number.isNaN(numericId)) {
          await Product.findOneAndUpdate({ id: numericId }, {
            $inc: { stock: -item.quantity }
          });
        }
      }
    }

    order.paymentStatus = 'success';
    order.orderStatus = 'shipped';
    order.paymentId = paymentId;
    await order.save();

    // Save payment record
    await Payment.create({
      userId: order.userId,
      orderId: order._id,
      gateway: 'stripe',
      transactionId: paymentId,
      amount: order.totalAmount,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      metadata: { orderId: order._id.toString() },
    });

    const customer = await require('../models/User').findById(order.userId);
    const invoicePath = await generateOrderInvoice(order, customer);
    order.invoicePath = invoicePath;
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.userId,
      type: 'order_update',
      message: `Payment received for Order #${order._id}. Your order has been handed over to the delivery team.`,
    });

    console.log('Order paymentSuccess: sending order confirmation email to', customer?.email);
    if (!customer?.email) {
      console.warn('Order paymentSuccess: customer email is missing for order', order._id);
    }

    await sendOrderConfirmation(customer?.email || '', {
      ...order.toObject(),
      invoicePath,
      customerName: customer?.name || 'Customer'
    });

    res.json({ message: 'Payment successful. Order shipped.', invoicePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Order Tracking Status & Send Notifications
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.orderStatus = status;
    await order.save();

    // Active Notification integration for Order Tracking
    await Notification.create({
      userId: order.userId,
      type: 'order_update',
      message: `Your Order #${order._id} status changes to: ${status}.`,
    });

    res.json({ message: `Delivery status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Logged-in User's Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('products.productId', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all orders with user and product details
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('products.productId', 'name category price');

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.userId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!order.invoicePath) {
      const customer = await require('../models/User').findById(order.userId);
      const invoicePath = await generateOrderInvoice(order, customer);
      order.invoicePath = invoicePath;
      await order.save();
    }

    res.download(order.invoicePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
