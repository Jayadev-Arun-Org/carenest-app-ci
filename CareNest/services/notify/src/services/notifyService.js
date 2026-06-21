const Notification = require('../models/Notification');

class NotifyService {
  /**
   * Create one or more notifications.
   * Accepts a single object or an array of { userId, title, message, type, meta }.
   */
  async create(payload) {
    if (Array.isArray(payload)) {
      return Notification.insertMany(payload);
    }
    return Notification.create(payload);
  }

  /** Get all notifications for a user, newest first. */
  async getByUser(userId) {
    const notifications = await Notification.find({ userId });
    return notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
  }

  /** Count unread notifications for a user. */
  async countUnread(userId) {
    return Notification.countDocuments({ userId, read: false });
  }

  /** Mark a single notification as read. */
  async markRead(id, userId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
    if (!notif) throw new Error('Notification not found');
    return notif;
  }

  /** Mark all notifications for a user as read. */
  async markAllRead(userId) {
    await Notification.updateMany({ userId, read: false }, { read: true });
  }
}

module.exports = new NotifyService();
