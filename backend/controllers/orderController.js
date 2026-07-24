
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

      item.productId = product._id;
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

    // Persist customer email on order for reliable delivery later
    if (req.user && req.user.email) {
      order.customerEmail = req.user.email;
    }

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
    console.log('paymentSuccess called with body:', { orderId, paymentId, user: req.user?._id });

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
    console.log('Stripe verification result:', verification);
    if (!verification.success) {
      order.paymentStatus = 'failed';
      await order.save();
      console.warn('paymentSuccess: stripe verification failed for', paymentId);
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
    console.log('paymentSuccess: resolved customer for order', order._id, '->', { customerEmail: customer?.email, customerId: customer?._id });

    // Ensure order has a customerEmail stored for fallback
    if (!order.customerEmail && (customer?.email || verification.customerEmail)) {
      order.customerEmail = customer?.email || verification.customerEmail;
    }

    const invoicePath = await generateOrderInvoice(order, customer);
    console.log('paymentSuccess: generated invoice at', invoicePath);
    order.invoicePath = invoicePath;
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.userId,
      type: 'order_update',
      message: `Payment received for Order #${order._id}. Your order has been handed over to the delivery team.`,
    });

    const emailToSend = customer?.email || verification.customerEmail || order?.customerEmail || '';
    console.log('Order paymentSuccess: determined recipient email:', emailToSend);
    if (!emailToSend) {
      console.warn('Order paymentSuccess: no recipient email available for order', order._id);
    }

    // Attempt to send email with retries and persist attempt info to order
    if (emailToSend) {
      const maxAttempts = 3;
      let attempt = 0;
      let sent = false;
      let lastError = null;

      while (attempt < maxAttempts && !sent) {
        attempt += 1;
        try {
          console.log(`Order paymentSuccess: sending email attempt ${attempt} to ${emailToSend}`);
          const info = await sendOrderConfirmation(emailToSend, {
            ...order.toObject(),
            invoicePath,
            customerName: customer?.name || 'Customer'
          });
          console.log('Order paymentSuccess: email sent', { attempt, messageId: info?.messageId, response: info?.response });
          sent = true;
          order.emailSent = true;
          order.emailSentAt = new Date();
          order.emailSendAttempts = attempt;
          order.emailLastError = '';
          await order.save();
          break;
        } catch (err) {
          lastError = err;
          console.error('Order paymentSuccess: email send failed attempt', attempt, err?.message);
          order.emailSendAttempts = attempt;
          order.emailLastError = err?.message || String(err);
          await order.save();
          // exponential backoff before retrying
          const waitMs = 500 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }

      if (!sent) {
        console.error('Order paymentSuccess: all email send attempts failed', { attempts: attempt, lastError: lastError?.message });
      }
    } else {
      console.warn('Order paymentSuccess: skipping email send because no email was found for order', order._id);
    }

    res.json({ message: 'Payment successful. Order shipped.', invoicePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendInvoice = async (req, res) => {
  let order;
  try {
    const { orderId } = req.params;
    order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const customer = await require('../models/User').findById(order.userId);
    const invoicePath = order.invoicePath || await generateOrderInvoice(order, customer);
    order.invoicePath = invoicePath;
    if (!order.customerEmail && customer?.email) {
      order.customerEmail = customer.email;
    }
    await order.save();

    const emailToSend = order.customerEmail || customer?.email;
    if (!emailToSend) {
      return res.status(400).json({ error: 'No recipient email available for order' });
    }

    const info = await sendOrderConfirmation(emailToSend, {
      ...order.toObject(),
      invoicePath,
      customerName: customer?.name || 'Customer'
    });

    order.emailSent = true;
    order.emailSentAt = new Date();
    order.emailSendAttempts = (order.emailSendAttempts || 0) + 1;
    order.emailLastError = '';
    await order.save();

    res.json({ success: true, message: 'Invoice resend triggered', info });
  } catch (error) {
    if (order) {
      order.emailSendAttempts = (order.emailSendAttempts || 0) + 1;
      order.emailLastError = error.message;
      await order.save().catch(() => {});
    }
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
