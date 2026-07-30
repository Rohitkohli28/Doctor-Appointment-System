const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAllRead, 
  deleteNotification, 
  clearAllNotifications 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

module.exports = router;
