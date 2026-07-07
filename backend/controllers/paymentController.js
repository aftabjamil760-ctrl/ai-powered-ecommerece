
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { processPayment, verifyStripePayment, refundStripePayment } = require('../utils/paymentService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Payment Session (Stripe Only)
exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, currency = 'USD' } = req.body;

    if (!orderId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }

    const paymentData = {
      orderId,
      amount,
      currency,
      customerEmail: req.user.email,
      customerName: req.user.name
    };

    const result = await processPayment(paymentData, 'stripe');

    res.json({
      success: true,
      message: 'Payment initiated successfully via Stripe',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Handle Stripe Webhook Events
exports.handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      await Order.findByIdAndUpdate(session.metadata.orderId, {
        paymentStatus: 'success',
        orderStatus: 'shipped',
        paymentId: session.payment_intent,
      });
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).send('Error processing webhook');
  }
};

// Verify Stripe Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const verification = await verifyStripePayment(paymentId);

    if (verification.success) {
      res.json({ success: true, data: verification });
    } else {
      res.status(400).json({ success: false, error: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Refund Stripe Payment
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid refund details' });
    }

    const refund = await refundStripePayment(paymentId, amount, reason);
    
    if (refund.success) {
      res.json({ success: true, message: 'Refund initiated successfully', data: refund });
    } else {
      res.status(400).json({ success: false, error: refund.message || 'Refund failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Payment History from local MongoDB
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
