const express = require('express');
const { body } = require('express-validator');
const {
  createNotification,
  getNotifications,
  markRead,
  markAllRead,
} = require('../controllers/notifyController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create notification(s) — called by other services / frontend
router.post(
  '/',
  authenticate,
  [
    body('userId').optional(),
    body('title').if(body().not().isArray()).notEmpty().withMessage('Title is required'),
    body('message').if(body().not().isArray()).notEmpty().withMessage('Message is required'),
  ],
  createNotification
);

// Get current user's notifications
router.get('/', authenticate, getNotifications);

// Mark all as read
router.put('/read-all', authenticate, markAllRead);

// Mark single as read
router.put('/:id/read', authenticate, markRead);

module.exports = router;
