const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Get unread count first (more specific route)
router.get('/count', protect, getUnreadCount);

// Get all notifications
router.get('/', protect, getNotifications);

// Mark all as read
router.put('/read-all', protect, markAllAsRead);

// Mark single notification as read
router.put('/:id/read', protect, markAsRead);

// Delete single notification
router.delete('/:id', protect, deleteNotification);

// Delete all notifications
router.delete('/', protect, deleteAllNotifications);

module.exports = router;
