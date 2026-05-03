const express = require('express');
const router = express.Router();
const { 
  getGlobalMessages, 
  sendGlobalMessage,
  getDirectMessages,
  sendDirectMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/global', getGlobalMessages);
router.post('/global', sendGlobalMessage);
router.get('/direct/:userId', getDirectMessages);
router.post('/direct', sendDirectMessage);

module.exports = router;
