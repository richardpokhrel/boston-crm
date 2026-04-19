const mongoose = require('mongoose')

const MESSAGE_TYPES = ['text', 'notification', 'document_update', 'status_change']

const messageSchema = new mongoose.Schema(
  {
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String },
    messageType: {
      type: String,
      enum: MESSAGE_TYPES,
      default: 'text',
    },
    subject: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    attachedDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isPinned: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    relatedAction: {
      actionType: String, // e.g., 'document_request', 'deadline_reminder'
      actionData: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
)

// Indexes
messageSchema.index({ relatedLead: 1, createdAt: -1 })
messageSchema.index({ recipient: 1, isRead: 1 })
messageSchema.index({ sender: 1, createdAt: -1 })
messageSchema.index({ relatedLead: 1, messageType: 1 })

module.exports = mongoose.model('Message', messageSchema)
module.exports.MESSAGE_TYPES = MESSAGE_TYPES
