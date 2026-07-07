
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

// Submit feedback for a verified order
exports.submitFeedback = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id; // standardizing req.user._id consistently

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

    // Update product rating data based on new feedback
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (product) {
      const oldCount = product.ratingCount || 0;
      const newCount = oldCount + 1;
      const oldAverage = product.ratingAverage || 0;
      product.ratingCount = newCount;
      product.ratingAverage = ((oldAverage * oldCount) + Number(rating)) / newCount;
      product.ratings.push({
        userId,
        rating: Number(rating),
        review: comment
      });
      await product.save();
    }

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin reply to feedback and notify customer
exports.replyToFeedback = async (req, res) => {
  try {
    const { feedbackId, reply } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

    feedback.adminReply = reply;
    await feedback.save();

    // Notify customer about the admin's response
    const notification = new Notification({
      userId: feedback.userId,
      message: `Admin replied to your feedback: ${reply}`,
      type: 'order_update' // unified type to maintain dashboard notification setup
    });

    await notification.save();
    res.json({ message: 'Reply sent and customer notified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get feedback history for logged-in user
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('productId', 'name');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all feedback (Useful for admin analytics dashboard)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate('productId', 'name');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
