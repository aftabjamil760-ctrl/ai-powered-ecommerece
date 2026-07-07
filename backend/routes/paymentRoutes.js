
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/payments/create
 * @desc    Create Stripe payment session
 * @access  Private
 */
router.post('/create', protect, paymentController.createPayment);

/**
 * @route   POST /api/payments/stripe-webhook
 * @desc    Stripe webhook endpoint (Requires Raw Body)
 * @access  Public
 */
router.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

/**
 * @route   GET /api/payments/verify/:paymentId
 * @desc    Verify Stripe payment status
 * @access  Private
 */
router.get('/verify/:paymentId', protect, paymentController.verifyPayment);

/**
 * @route   POST /api/payments/refund
 * @desc    Refund Stripe payment
 * @access  Private
 */
router.post('/refund', protect, paymentController.refundPayment);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history from local MongoDB
 * @access  Private
 */
router.get('/history', protect, paymentController.getPaymentHistory);

module.exports = router;
