const router = require('express').Router()
const {
  getLeadMessages,
  sendMessage,
  markMessageAsRead,
  togglePinMessage,
  deleteMessage,
  getUnreadCount,
} = require('../controllers/messageController')
const { protect } = require('../middleware/auth')

// All routes require auth
router.use(protect)

// Get messages for a lead
router.get('/lead/:leadId', getLeadMessages)

// Get unread count
router.get('/unread/count', getUnreadCount)

// Send message
router.post('/', sendMessage)

// Mark as read
router.patch('/:id/read', markMessageAsRead)

// Pin/unpin message
router.patch('/:id/pin', togglePinMessage)

// Delete message
router.delete('/:id', deleteMessage)

module.exports = router
