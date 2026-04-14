const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    taskType: {
      type: String,
      enum: ['call', 'email', 'document', 'interview', 'payment', 'visa', 'system', 'other'],
      required: true,
    },
    source: {
      type: String,
      enum: ['manual', 'auto_generated', 'recurring'],
      default: 'manual',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'overdue', 'cancelled'],
      default: 'open',
    },
    dueAt: { type: Date, required: true },
    slaHours: { type: Number },
    slaBreached: { type: Boolean, default: false },
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    escalatedAt: { type: Date },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completionNote: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelReason: { type: String },
  },
  { timestamps: true }
)

taskSchema.index({ assignedTo: 1, status: 1 })
taskSchema.index({ dueAt: 1 })
taskSchema.index({ relatedLead: 1 })
taskSchema.index({ priority: 1, status: 1 })

// SLA hours map
const SLA_HOURS = { critical: 2, high: 4, medium: 24, low: 72 }

taskSchema.pre('validate', function (next) {
  if (!this.slaHours && this.priority) {
    this.slaHours = SLA_HOURS[this.priority]
  }
  next()
})

module.exports = mongoose.model('Task', taskSchema)
