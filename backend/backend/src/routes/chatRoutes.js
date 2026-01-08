const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// All chat routes require authentication
router.use(auth);

// Get chat by booking
router.get('/:bookingId', chatController.getChatByBooking);

// Send message in chat
router.post('/:bookingId/message', chatController.postMessage);

// Admin broadcast/direct message
router.post('/admin/message', chatController.postAdminMessage);

module.exports = router;

