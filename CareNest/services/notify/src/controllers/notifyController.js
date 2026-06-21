const { validationResult } = require('express-validator');
const notifyService = require('../services/notifyService');

const createNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Auto-set userId from JWT if not provided in body
    let payload = req.body;
    if (Array.isArray(payload)) {
      payload = payload.map((item) => ({
        ...item,
        userId: item.userId || req.user.id,
      }));
    } else {
      payload = { ...payload, userId: payload.userId || req.user.id };
    }

    const result = await notifyService.create(payload);
    res.status(201).json({ message: 'Notification(s) created', notifications: Array.isArray(result) ? result : [result] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await notifyService.getByUser(req.user.id);
    const unreadCount = await notifyService.countUnread(req.user.id);
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const notification = await notifyService.markRead(req.params.id, req.user.id);
    res.json({ message: 'Marked as read', notification });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await notifyService.markAllRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNotification, getNotifications, markRead, markAllRead };
