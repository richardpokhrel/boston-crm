const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "lead.status_changed"
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    entityLabel: { type: String }, // human-readable label for quick reading
    beforeState: { type: mongoose.Schema.Types.Mixed },
    afterState: { type: mongoose.Schema.Types.Mixed },
    changeDelta: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
    // Immutable — no updates allowed (enforced at middleware level)
  }
)

activityLogSchema.index({ actor: 1 })
activityLogSchema.index({ entityType: 1, entityId: 1 })
activityLogSchema.index({ action: 1 })
activityLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('ActivityLog', activityLogSchema)
