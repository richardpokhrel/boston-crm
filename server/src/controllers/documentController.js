const Document = require('../models/Document')
const Lead = require('../models/Lead')
const ActivityLog = require('../models/ActivityLog')
const { ApiResponse, ApiError } = require('../utils/apiHelpers')
const path = require('path')
const fs = require('fs').promises

// GET /api/documents - Get all documents (everyone can view all documents as checklist)
const getAllDocuments = async (req, res, next) => {
  try {
    const { leadId, status, documentType } = req.query

    const filter = {}
    if (leadId) filter.relatedLead = leadId
    if (status) filter.status = status
    if (documentType) filter.documentType = documentType

    const documents = await Document.find(filter)
      .populate('relatedLead', 'fullName phone email')
      .populate('uploadedBy', 'fullName email role')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 })

    return ApiResponse.success(res, { documents })
  } catch (err) {
    next(err)
  }
}

// GET /api/documents/lead/:leadId - Get all documents for a specific lead
const getLeadDocuments = async (req, res, next) => {
  try {
    const { leadId } = req.params

    // Verify lead exists
    const lead = await Lead.findById(leadId)
    if (!lead) throw ApiError.notFound('Lead not found')

    const documents = await Document.find({ relatedLead: leadId })
      .populate('uploadedBy', 'fullName email role')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 })

    return ApiResponse.success(res, { documents })
  } catch (err) {
    next(err)
  }
}

// POST /api/documents - Upload a new document (admin & student only)
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) throw ApiError.badRequest('File is required')

    const { leadId, documentType, title, description, expiryDate } = req.body

    if (!leadId) throw ApiError.badRequest('leadId is required')
    if (!documentType) throw ApiError.badRequest('documentType is required')
    if (!title) throw ApiError.badRequest('title is required')

    // Only admin and student can upload
    if (req.user.role !== 'admin' && req.user.role !== 'student') {
      throw ApiError.forbidden('Only admin and student can upload documents')
    }

    // Verify lead exists
    const lead = await Lead.findById(leadId)
    if (!lead) throw ApiError.notFound('Lead not found')

    // If student, can only upload for themselves
    if (req.user.role === 'student' && req.user._id.toString() !== lead.createdBy?.toString()) {
      throw ApiError.forbidden('Student can only upload documents for their own lead')
    }

    const document = await Document.create({
      relatedLead: leadId,
      documentType,
      title: title.trim(),
      description: description?.trim(),
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    })

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'document.uploaded',
      entityType: 'document',
      entityId: document._id,
      entityLabel: title,
      afterState: document.toObject(),
      ipAddress: req.ip,
    })

    await document.populate('uploadedBy', 'fullName email')

    return ApiResponse.created(res, { document }, 'Document uploaded successfully')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/documents/:id - Update document status (admin & student only)
const updateDocumentStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes, rejectionReason, requestReuploadReason, isVerified } = req.body
    const document = await Document.findById(req.params.id)

    if (!document) throw ApiError.notFound('Document not found')

    // Only admin and student can update
    if (req.user.role !== 'admin' && req.user.role !== 'student') {
      throw ApiError.forbidden('Only admin and student can update document status')
    }

    // If student, can only update their own documents
    if (req.user.role === 'student' && req.user._id.toString() !== document.uploadedBy.toString()) {
      throw ApiError.forbidden('Student can only update their own documents')
    }

    const before = document.toObject()

    if (status) document.status = status
    if (reviewNotes) document.reviewNotes = reviewNotes
    if (rejectionReason) document.rejectionReason = rejectionReason
    if (requestReuploadReason) document.requestReuploadReason = requestReuploadReason
    if (isVerified !== undefined) {
      document.isVerified = isVerified
      if (isVerified) document.verificationDate = new Date()
    }

    document.reviewedBy = req.user._id

    await document.save()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'document.status_updated',
      entityType: 'document',
      entityId: document._id,
      beforeState: before,
      afterState: document.toObject(),
      ipAddress: req.ip,
    })

    await document.populate('uploadedBy', 'fullName email')
    await document.populate('reviewedBy', 'fullName email')

    return ApiResponse.success(res, { document }, 'Document status updated')
  } catch (err) {
    next(err)
  }
}

// DELETE /api/documents/:id - Delete a document (admin & student only)
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
    if (!document) throw ApiError.notFound('Document not found')

    // Only admin can delete any document, student can only delete their own
    if (req.user.role === 'admin') {
      // Admin can delete any document
    } else if (req.user.role === 'student') {
      // Student can only delete their own documents
      if (req.user._id.toString() !== document.uploadedBy.toString()) {
        throw ApiError.forbidden('Student can only delete their own documents')
      }
    } else {
      // Other roles cannot delete
      throw ApiError.forbidden('Only admin and student can delete documents')
    }

    const filePath = path.join(__dirname, '../../', document.fileUrl)
    try {
      await fs.unlink(filePath)
    } catch (err) {
      console.warn('File deletion failed:', err.message)
    }

    await document.deleteOne()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'document.deleted',
      entityType: 'document',
      entityId: document._id,
      beforeState: document.toObject(),
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, {}, 'Document deleted')
  } catch (err) {
    next(err)
  }
}

// GET /api/documents/:id/download - Download a document
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
    if (!document) throw ApiError.notFound('Document not found')

    const filePath = path.join(__dirname, '../../', document.fileUrl)
    res.download(filePath, document.fileName)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllDocuments,
  getLeadDocuments,
  uploadDocument,
  updateDocumentStatus,
  deleteDocument,
  downloadDocument,
}
