const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Import middleware for raw body parsing (for Stripe webhook)
const bodyParser = require('body-parser');

/**
 * @route   POST /api/payments/create
 * @desc    Create payment session
 * @access  Private
 */
router.post('/create', protect, paymentController.createPayment);

/**
 * @route   POST /api/payments/easypaisa-callback
 * @desc    EasyPaisa payment callback/webhook
 * @access  Public
 */
router.post('/easypaisa-callback', paymentController.handleEasyPaisaCallback);

/**
 * @route   POST /api/payments/stripe-webhook
 * @desc    Stripe webhook endpoint
 * @access  Public
 */
router.post(
  '/stripe-webhook',
  bodyParser.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

/**
 * @route   GET /api/payments/verify/:paymentId
 * @desc    Verify payment status
 * @access  Private
 */
router.get('/verify/:paymentId', protect, paymentController.verifyPayment);

/**
 * @route   GET /api/payments/methods/:country?
 * @desc    Get available payment methods for a country
 * @access  Public
 */
router.get('/methods/:country', paymentController.getPaymentMethods);
router.get('/methods', paymentController.getPaymentMethods);

/**
 * @route   GET /api/payments/status/:paymentId
 * @desc    Get payment status
 * @access  Private
 */
router.get('/status/:paymentId', protect, paymentController.getPaymentStatus);

/**
 * @route   POST /api/payments/refund
 * @desc    Refund payment
 * @access  Private
 */
router.post('/refund', protect, paymentController.refundPayment);

/**
 * @route   POST /api/payments/mock
 * @desc    Create mock payment (development only)
 * @access  Private
 */
router.post('/mock', protect, paymentController.mockPayment);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history for user
 * @access  Private
 */
router.get('/history', protect, paymentController.getPaymentHistory);

module.exports = router;