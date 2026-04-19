const mongoose = require('mongoose')

const DOCUMENT_TYPES = [
  'passport',
  'visa',
  'transcript',
  'degree_certificate',
  'bank_statement',
  'ielts_score',
  'toefl_score',
  'gre_score',
  'gmat_score',
  'work_experience',
  'recommendation_letter',
  'statement_of_purpose',
  'cv_resume',
  'medical_report',
  'police_clearance',
  'birth_certificate',
  'marriage_certificate',
  'other',
]

const DOCUMENT_STATUSES = [
  'pending_upload',
  'uploaded',
  'under_review',
  'approved',
  'rejected',
  'requested_reupload',
]

const documentSchema = new mongoose.Schema(
  {
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    documentType: {
      type: String,
      enum: DOCUMENT_TYPES,
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    status: {
      type: String,
      enum: DOCUMENT_STATUSES,
      default: 'uploaded',
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String },
    expiryDate: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    rejectionReason: { type: String },
    requestReuploadReason: { type: String },
  },
  { timestamps: true }
)

// Indexes
documentSchema.index({ relatedLead: 1, status: 1 })
documentSchema.index({ relatedLead: 1, documentType: 1 })
documentSchema.index({ uploadedBy: 1 })
documentSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Document', documentSchema)
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES
module.exports.DOCUMENT_STATUSES = DOCUMENT_STATUSES
