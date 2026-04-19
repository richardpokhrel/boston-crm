const Message = require('../models/Message')
const Lead = require('../models/Lead')
const User = require('../models/User')
const ActivityLog = require('../models/ActivityLog')
const { ApiResponse, ApiError } = require('../utils/apiHelpers')

// GET /api/messages/lead/:leadId - Get all messages for a lead
const getLeadMessages = async (req, res, next) => {
  try {
    const { leadId } = req.params

    // Verify lead exists
    const lead = await Lead.findById(leadId)
    if (!lead) throw ApiError.notFound('Lead not found')

    // Check authorization
    if (
      req.user.role === 'student' &&
      req.user._id.toString() !== lead.createdBy?.toString()
    ) {
      throw ApiError.forbidden('Unauthorized to view these messages')
    }

    const messages = await Message.find({ relatedLead: leadId })
      .populate('sender', 'fullName email role')
      .populate('recipient', 'fullName email role')
      .populate('attachedDocument', 'title fileName documentType')
      .sort({ createdAt: -1 })

    return ApiResponse.success(res, { messages })
  } catch (err) {
    next(err)
  }
}

// POST /api/messages - Send a message
const sendMessage = async (req, res, next) => {
  try {
    const { leadId, subject, content, priority, messageType, attachedDocument } = req.body

    if (!leadId) throw ApiError.badRequest('leadId is required')
    if (!content || content.trim() === '') throw ApiError.badRequest('content is required')

    // Verify lead exists
    const lead = await Lead.findById(leadId)
    if (!lead) throw ApiError.notFound('Lead not found')

    const message = await Message.create({
      relatedLead: leadId,
      sender: req.user._id,
      senderRole: req.user.role,
      subject: subject?.trim() || `Message from ${req.user.fullName}`,
      content: content.trim(),
      messageType: messageType || 'text',
      priority: priority || 'normal',
      attachedDocument: attachedDocument || null,
    })

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'message.sent',
      entityType: 'message',
      entityId: message._id,
      entityLabel: subject || 'New Message',
      afterState: message.toObject(),
      ipAddress: req.ip,
    })

    await message.populate('sender', 'fullName email role')
    await message.populate('attachedDocument', 'title fileName documentType')

    return ApiResponse.created(res, { message }, 'Message sent successfully')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/messages/:id/read - Mark message as read
const markMessageAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) throw ApiError.notFound('Message not found')

    message.isRead = true
    message.readAt = new Date()
    await message.save()

    return ApiResponse.success(res, { message }, 'Message marked as read')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/messages/:id/pin - Pin/unpin a message
const togglePinMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) throw ApiError.notFound('Message not found')

    // Check authorization - only sender or recipient can pin
    if (
      req.user._id.toString() !== message.sender.toString() &&
      req.user._id.toString() !== message.recipient?.toString() &&
      req.user.role !== 'admin'
    ) {
      throw ApiError.forbidden('Unauthorized to pin this message')
    }

    message.isPinned = !message.isPinned
    await message.save()

    return ApiResponse.success(res, { message }, `Message ${message.isPinned ? 'pinned' : 'unpinned'}`)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/messages/:id - Delete a message
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) throw ApiError.notFound('Message not found')

    // Only sender or admin can delete
    if (req.user._id.toString() !== message.sender.toString() && req.user.role !== 'admin') {
      throw ApiError.forbidden('Unauthorized to delete this message')
    }

    await message.deleteOne()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'message.deleted',
      entityType: 'message',
      entityId: message._id,
      beforeState: message.toObject(),
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, {}, 'Message deleted')
  } catch (err) {
    next(err)
  }
}

// GET /api/messages/unread/count - Get unread message count for current user
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
    })

    return ApiResponse.success(res, { unreadCount: count })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getLeadMessages,
  sendMessage,
  markMessageAsRead,
  togglePinMessage,
  deleteMessage,
  getUnreadCount,
}
