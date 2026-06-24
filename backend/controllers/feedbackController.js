const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

exports.submitFeedback = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.userId;
    
    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(400).json({ error: 'Order not found' });
    
    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ orderId, productId });
    if (existingFeedback) return res.status(400).json({ error: 'Feedback already submitted' });
    
    const feedback = new Feedback({
      userId,
      productId,
      orderId,
      rating,
      comment
    });
    
    await feedback.save();
    
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.replyToFeedback = async (req, res) => {
  try {
    const { feedbackId, reply } = req.body;
    
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    
    feedback.adminReply = reply;
    feedback.replied = true;
    await feedback.save();
    
    // Create notification for customer
    const notification = new Notification({
      userId: feedback.userId,
      message: `Admin replied to your feedback: ${reply}`,
      type: 'feedback_reply'
    });
    
    await notification.save();
    
    res.json({ message: 'Reply sent and customer notified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
