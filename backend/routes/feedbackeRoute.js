const express = require('express');
const { submitFeedback, replyToFeedback, getUserFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuthMiddleware');
const router = express.Router();

router.post('/submit', protect, submitFeedback);
router.post('/reply', adminAuth, replyToFeedback);
router.get('/user', protect, getUserFeedback);
router.get('/admin', adminAuth, getAllFeedback);

module.exports = router;