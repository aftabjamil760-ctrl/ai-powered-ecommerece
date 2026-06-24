const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
