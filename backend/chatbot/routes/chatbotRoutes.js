const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../../middleware/authMiddleware');
const adminAuth = require('../../middleware/adminAuthMiddleware');

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to chatbot
 * @access  Public (with optional auth)
 */
router.post('/message', chatbotController.chat);

/**
 * @route   POST /api/chatbot/message/customer
 * @desc    Customer chatbot conversation
 * @access  Private
 */
router.post('/message/customer', protect, chatbotController.customerChat);

/**
 * @route   POST /api/chatbot/message/admin
 * @desc    Admin chatbot conversation
 * @access  Admin
 */
router.post('/message/admin', protect, adminAuth, chatbotController.adminChat);

/**
 * @route   GET /api/chatbot/history/:sessionId
 * @desc    Get chat history
 * @access  Private
 */
router.get('/history/:sessionId', protect, chatbotController.getHistory);
router.get('/session', protect, chatbotController.getLastSession);

/**
 * @route   GET /api/chatbot/context/:sessionId
 * @desc    Get session context
 * @access  Private
 */
router.get('/context/:sessionId', protect, chatbotController.getSessionContext);

/**
 * @route   POST /api/chatbot/end-session
 * @desc    End chat session
 * @access  Private
 */
router.post('/end-session', protect, chatbotController.endSession);

/**
 * @route   GET /api/chatbot/recommendations
 * @desc    Get product recommendations
 * @access  Public
 */
router.get('/recommendations', chatbotController.getRecommendations);

/**
 * @route   GET /api/chatbot/search
 * @desc    Semantic product search
 * @access  Public
 */
router.get('/search', chatbotController.searchProducts);

/**
 * @route   POST /api/chatbot/index-products
 * @desc    Index products for semantic search
 * @access  Private (Admin)
 */
router.post('/index-products', protect, adminAuth, chatbotController.indexProducts);

module.exports = router;