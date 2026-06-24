const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { processPayment, verifyStripePayment } = require('../utils/paymentService');

exports.createOrder = async (req, res) => {
  try {
    const { products, deliveryAddress } = req.body;
    const userId = req.user._id;
    
    // Calculate total and check stock
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      
      totalAmount += (product.price - (product.price * (product.discount / 100))) * item.quantity;
    }
    
    // Create order
    const order = new Order({
      userId,
      products,
      totalAmount,
      deliveryAddress,
      paymentStatus: 'pending',
      orderStatus: 'processing'
    });
    
    await order.save();
    
    // Process payment (integrate with Stripe/Razorpay/etc.)
    const paymentResult = await processPayment({
      amount: totalAmount,
      orderId: order._id,
      customerEmail: req.user.email
    });
    
    // Update order with payment ID
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

exports.paymentSuccess = async (req, res) => {
  try {
    const { orderId, paymentId, gateway = 'stripe' } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Idempotency: if already succeeded, don't double-decrement stock
    if (order.paymentStatus === 'success') {
      return res.json({ message: 'Order already confirmed.' });
    }

    // Verify payment before marking order paid
    if (gateway === 'stripe') {
      const verification = await verifyStripePayment(paymentId);
      if (!verification.success) {
        order.paymentStatus = 'failed';
        await order.save();
        return res.status(400).json({ error: 'Stripe payment not confirmed' });
      }
    }
    
    // Update stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }
    
    // Update order status
    order.paymentStatus = 'success';
    order.orderStatus = 'shipped';
    order.paymentId = paymentId;
    await order.save();
    
    // Save payment record
    await Payment.create({
      userId: order.userId,
      orderId: order._id,
      gateway,
      transactionId: paymentId,
      amount: order.totalAmount,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      metadata: { orderId: order._id.toString() },
    });

    // Notify customer (delivery team simulation via order status)
    await Notification.create({
      userId: order.userId,
      type: 'order_update',
      message: `Payment received for Order #${order._id}. Your order has been handed to delivery team.`,
    });
    
    res.json({ message: 'Payment successful. Order shipped to delivery team.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.orderStatus = status;
    await order.save();
    
    if (status === 'delivered') {
      // TODO: Send notification to customer
      // TODO: Save to service logs
    }
    
    res.json({ message: `Delivery status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};