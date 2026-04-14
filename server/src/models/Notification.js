const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      required: true,
      enum: [
        'task_assigned', 'status_changed', 'doc_uploaded', 'sla_breach',
        'escalation', 'message', 'login_alert', 'system_error', 'general',
      ],
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    actionUrl: { type: String },
    entityType: {
      type: String,
      enum: ['lead', 'task', 'document', 'user', 'visa_app', 'interview'],
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'sms'],
      default: 'in_app',
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, isRead: 1 })
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ entityType: 1, entityId: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index

module.exports = mongoose.model('Notification', notificationSchema)
