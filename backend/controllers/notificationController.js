
const Notification = require('../models/Notification');
const { isDatabaseUnavailableError } = require('../middleware/authMiddleware');

// Get all notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: 'Database unavailable, please try again later' });
    }
    return res.status(500).json({ error: error.message });
  }
};

// Mark a specific notification as read
exports.markAsRead = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return res.status(503).json({ error: 'Database unavailable, please try again later' });
    }
    return res.status(500).json({ error: error.message });
  }
};
