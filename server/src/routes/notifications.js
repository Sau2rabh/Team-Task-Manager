const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAsRead, markAllAsRead, broadcastNotification } = require('../controllers/notificationController');
const { isAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.post('/broadcast', protect, isAdmin, broadcastNotification);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);

module.exports = router;
