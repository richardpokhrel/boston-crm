const mongoose = require('mongoose')

const LEAD_STATUSES = [
  'new',
  'contacted',
  'interested',
  'docs_received',
  'initial_docs_completed',
  'pre_conditional',
  'pre_enrolled',
  'enrolled',
  'lost',
]

const leadSchema = new mongoose.Schema(
  {
    id : { type: String, unique: true, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: LEAD_STATUSES, default: 'new' },
    source: {
      type: String,
      enum: ['facebook', 'instagram', 'website', 'referral', 'manual', 'csv_import'],
      required: true,
    },
    utmCampaign: { type: String },
    programInterest: { type: String, trim: true },
    destinationCountry: { type: String, trim: true },
    assignedCounsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attemptCount: { type: Number, default: 0, min: 0 },
    lastAttemptAt: { type: Date },
    qualificationNotes: { type: String },
    lostReason: { type: String },
    lostReasonCategory: {
      type: String,
      enum: ['financial', 'unresponsive', 'not_interested', 'failed_interview', 'visa_refused', 'duplicate', 'withdrew', 'other'],
    },
    lostAt: { type: Date },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    interviewReady: { type: Boolean, default: false },
    interviewReadyAt: { type: Date },
    slaDueAt: { type: Date },
    enrolledAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// ── Indexes ────────────────────────────────────────────────────────────────
leadSchema.index({ status: 1 })
leadSchema.index({ assignedCounsellor: 1, status: 1 })
leadSchema.index({ slaDueAt: 1 })
leadSchema.index({ phone: 1 })
leadSchema.index({ email: 1 })
leadSchema.index({ source: 1 })
leadSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Lead', leadSchema)
module.exports.LEAD_STATUSES = LEAD_STATUSES
