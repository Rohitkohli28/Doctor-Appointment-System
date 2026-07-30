const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted permanently' });
  } catch (error) {
    next(error);
  }
};

exports.clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'All notifications cleared permanently' });
  } catch (error) {
    next(error);
  }
};
