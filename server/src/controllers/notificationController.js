const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { getIo } = require('../socket/socket');

// Internal helper for creating notifications (can be used by other controllers)
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    const io = getIo();
    io.to(data.recipient.toString()).emit('notification', notification);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

exports.broadcastNotification = async (req, res) => {
  const { message } = req.body;
  try {
    const User = require('../models/User');
    const users = await User.find({ _id: { $ne: req.user._id } });
    
    const notifications = users.map(u => ({
      recipient: u._id,
      sender: req.user._id,
      type: 'STATUS_UPDATE',
      message: message,
    }));

    await Notification.insertMany(notifications);
    
    // Notify all via socket
    const io = getIo();
    io.emit('broadcast_notification', { message: message, sender: req.user.name });
    
    res.status(201).json({ message: 'Broadcast notification created for all users' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
