const Lead = require('../models/Lead')
const Task = require('../models/Task')
const ActivityLog = require('../models/ActivityLog')
const User = require('../models/User')
const { ApiResponse, ApiError, paginate, paginationMeta } = require('../utils/apiHelpers')
const csv = require('csv-parse/sync')

// GET /api/leads
const getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, source, counsellor, search, slaBreached } = req.query
    const { skip, limit: lim } = paginate(page, limit)

    const filter = {}

    // Counsellors only see their own leads
    if (req.user.role === 'counsellor') {
      filter.assignedCounsellor = req.user._id
    } else if (counsellor) {
      filter.assignedCounsellor = counsellor
    }

    if (status) filter.status = status
    if (source) filter.source = source
    if (slaBreached === 'true') filter.slaDueAt = { $lt: new Date() }
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedCounsellor', 'fullName email')
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Lead.countDocuments(filter),
    ])

    return ApiResponse.paginated(res, leads, paginationMeta(total, page, lim))
  } catch (err) {
    next(err)
  }
}

// POST /api/leads
const createLead = async (req, res, next) => {
  try {
    // Basic deduplication check (phone)
    const dup = await Lead.findOne({ phone: req.body.phone })
    if (dup) {
      // Mark new record as duplicate but still create
      req.body.isDuplicate = true
      req.body.duplicateOf = dup._id
    }

    const lead = await Lead.create({ ...req.body, createdBy: req.user._id })

    // Auto-create first contact task
    const slaDue = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2h SLA
    await Task.create({
      title: `First contact: ${lead.fullName}`,
      taskType: 'call',
      source: 'auto_generated',
      assignedTo: lead.assignedCounsellor || req.user._id,
      assignedBy: req.user._id,
      relatedLead: lead._id,
      priority: 'critical',
      dueAt: slaDue,
    })

    // Log activity
    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'lead.created',
      entityType: 'lead',
      entityId: lead._id,
      entityLabel: lead.fullName,
      afterState: lead.toObject(),
      ipAddress: req.ip,
    })

    return ApiResponse.created(res, { lead }, 'Lead created')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/leads/:id
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) throw ApiError.notFound('Lead not found')

    const before = lead.toObject()
    Object.assign(lead, req.body)
    await lead.save()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'lead.updated',
      entityType: 'lead',
      entityId: lead._id,
      entityLabel: lead.fullName,
      beforeState: before,
      afterState: lead.toObject(),
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, { lead }, 'Lead updated')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/leads/:id/status
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status, reason, reasonCategory } = req.body
    const lead = await Lead.findById(req.params.id)
    if (!lead) throw ApiError.notFound('Lead not found')

    const prevStatus = lead.status
    if (prevStatus === status) throw ApiError.badRequest('Lead is already in this status')

    lead.status = status
    if (status === 'lost') {
      lead.lostReason = reason
      lead.lostReasonCategory = reasonCategory
      lead.lostAt = new Date()
    }
    if (status === 'enrolled') lead.enrolledAt = new Date()

    await lead.save()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'lead.status_changed',
      entityType: 'lead',
      entityId: lead._id,
      entityLabel: lead.fullName,
      beforeState: { status: prevStatus },
      afterState: { status: lead.status },
      changeDelta: { status: [prevStatus, status] },
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, { lead }, `Status updated to ${status}`)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/leads/:id  (admin only)
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) throw ApiError.notFound('Lead not found')
    if (lead.status === 'enrolled') {
      throw ApiError.badRequest('Cannot delete an enrolled lead')
    }
    await lead.deleteOne()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'lead.deleted',
      entityType: 'lead',
      entityId: lead._id,
      entityLabel: lead.fullName,
      beforeState: lead.toObject(),
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, {}, 'Lead deleted')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/leads/:id/admin (admin only) - Override any field
const adminUpdateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) throw ApiError.notFound('Lead not found')

    const before = lead.toObject()
    Object.assign(lead, req.body)
    await lead.save()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'lead.admin_updated',
      entityType: 'lead',
      entityId: lead._id,
      entityLabel: lead.fullName,
      beforeState: before,
      afterState: lead.toObject(),
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, { lead }, 'Lead updated by admin')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/leads/:id/admin/reassign (admin only) - Reassign lead
const adminReassignLead = async (req, res, next) => {
  try {
    const { assignedCounsellor } = req.body
    if (!assignedCounsellor) throw ApiError.badRequest('assignedCounsellor is required')

    const lead = await Lead.findById(req.params.id)
    if (!lead) throw ApiError.notFound('Lead not found')

    // Verify counsellor exists
    const counsellor = await User.findById(assignedCounsellor)
    if (!counsellor) throw ApiError.notFound('Counsellor not found')

    const before = lead.toObject()
    lead.assignedCounsellor = assignedCounsellor
    await lead.save()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'lead.admin_reassigned',
      entityType: 'lead',
      entityId: lead._id,
      entityLabel: lead.fullName,
      beforeState: before,
      afterState: lead.toObject(),
      changeDelta: { assignedCounsellor: [before.assignedCounsellor?.toString(), assignedCounsellor] },
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, { lead }, 'Lead reassigned')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/leads/:id/admin/status (admin only) - Override status
const adminUpdateLeadStatus = async (req, res, next) => {
  try {
    const { status, reason, reasonCategory } = req.body
    const lead = await Lead.findById(req.params.id)
    if (!lead) throw ApiError.notFound('Lead not found')

    const prevStatus = lead.status
    if (prevStatus === status) throw ApiError.badRequest('Lead is already in this status')

    lead.status = status
    if (status === 'lost') {
      lead.lostReason = reason
      lead.lostReasonCategory = reasonCategory
      lead.lostAt = new Date()
    }
    if (status === 'enrolled') lead.enrolledAt = new Date()

    await lead.save()

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'lead.admin_status_changed',
      entityType: 'lead',
      entityId: lead._id,
      entityLabel: lead.fullName,
      beforeState: { status: prevStatus },
      afterState: { status: lead.status },
      changeDelta: { status: [prevStatus, status] },
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, { lead }, `Status updated to ${status} by admin`)
  } catch (err) {
    next(err)
  }
}

// ──────────────────────────────────────────────────────────────────────────
// CSV IMPORT FUNCTIONALITY
// ──────────────────────────────────────────────────────────────────────────

// Get all counsellors for assignment
const getCounsellors = async (req, res, next) => {
  try {
    const counsellors = await User.find({ role: 'counsellor', isActive: true }).select('_id fullName email')
    return ApiResponse.success(res, { counsellors })
  } catch (err) {
    next(err)
  }
}

// Get next counsellor for round-robin assignment
const getNextCounsellor = async () => {
  const counsellors = await User.find({ role: 'counsellor', isActive: true }).select('_id')

  if (counsellors.length === 0) throw ApiError.badRequest('No active counsellors available')

  // Get the counsellor with fewest assigned leads
  const leadCounts = await Promise.all(
    counsellors.map(async (c) => ({
      counsellor: c._id,
      count: await Lead.countDocuments({ assignedCounsellor: c._id }),
    }))
  )

  const nextCounsellor = leadCounts.reduce((min, current) =>
    current.count < min.count ? current : min
  )

  return nextCounsellor.counsellor
}

// POST /api/leads/import/csv (admin only)
const importLeadsFromCsv = async (req, res, next) => {
  try {
    if (!req.file) throw ApiError.badRequest('CSV file is required')

    const { assignmentStrategy = 'round-robin', assignedCounsellor } = req.body

    // Parse CSV
    const content = req.file.buffer.toString('utf-8')
    const records = csv.parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (records.length === 0) throw ApiError.badRequest('CSV file is empty')

    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'email']
    const firstRecord = records[0]
    const missingFields = requiredFields.filter((f) => !firstRecord[f])
    if (missingFields.length > 0) {
      throw ApiError.badRequest(`Missing required fields: ${missingFields.join(', ')}`)
    }

    const imported = []
    const duplicates = []
    const errors = []

    for (let i = 0; i < records.length; i += 1) {
      try {
        const record = records[i]

        // Normalize phone
        const phone = record.phone.replace(/\D/g, '')
        if (phone.length < 10) {
          errors.push({ row: i + 2, error: 'Invalid phone number' })
          continue
        }

        // Check for duplicates
        const existingLead = await Lead.findOne({ phone })
        if (existingLead) {
          duplicates.push({ fullName: record.fullName, phone, reason: 'Phone already exists' })
          continue
        }

        // Determine assignment
        let counsellorId = assignedCounsellor
        if (assignmentStrategy === 'round-robin') {
          counsellorId = await getNextCounsellor()
        } else if (!counsellorId) {
          errors.push({ row: i + 2, error: 'No counsellor assigned' })
          continue
        }

        // Create lead
        const lead = await Lead.create({
          fullName: record.fullName.trim(),
          email: record.email?.toLowerCase().trim() || undefined,
          phone,
          source: 'csv_import',
          programInterest: record.programInterest?.trim() || undefined,
          destinationCountry: record.destinationCountry?.trim() || undefined,
          assignedCounsellor: counsellorId,
          createdBy: req.user._id,
        })

        // Create first contact task
        const slaDue = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2h SLA
        await Task.create({
          title: `First contact: ${lead.fullName}`,
          taskType: 'call',
          source: 'auto_generated',
          assignedTo: counsellorId,
          assignedBy: req.user._id,
          relatedLead: lead._id,
          priority: 'critical',
          dueAt: slaDue,
        })

        imported.push(lead._id)
      } catch (err) {
        errors.push({ row: i + 2, error: err.message })
      }
    }

    await ActivityLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'leads.bulk_imported',
      entityType: 'lead',
      description: `Bulk imported ${imported.length} leads via CSV`,
      metadata: {
        totalRows: records.length,
        importedCount: imported.length,
        duplicateCount: duplicates.length,
        errorCount: errors.length,
        assignmentStrategy,
      },
      ipAddress: req.ip,
    })

    return ApiResponse.success(res, {
      imported: imported.length,
      duplicates,
      errors,
      summary: {
        total: records.length,
        imported: imported.length,
        failed: duplicates.length + errors.length,
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/leads/bulk-assign (admin only) - Bulk reassign leads
const bulkAssignLeads = async (req, res, next) => {
  try {
    const { leadIds, assignedCounsellor, assignmentStrategy } = req.body

    if (!leadIds || leadIds.length === 0) throw ApiError.badRequest('leadIds is required')
    if (!assignmentStrategy) throw ApiError.badRequest('assignmentStrategy is required')

    if (assignmentStrategy === 'direct' && !assignedCounsellor) {
      throw ApiError.badRequest('assignedCounsellor is required for direct assignment')
    }

    const updated = []
    for (const leadId of leadIds) {
      const lead = await Lead.findById(leadId)
      if (!lead) continue

      let counsellorId = assignedCounsellor
      if (assignmentStrategy === 'round-robin') {
        counsellorId = await getNextCounsellor()
      }

      const before = lead.toObject()
      lead.assignedCounsellor = counsellorId
      await lead.save()

      await ActivityLog.create({
        actor: req.user._id,
        actorRole: req.user.role,
        action: 'lead.admin_reassigned',
        entityType: 'lead',
        entityId: lead._id,
        entityLabel: lead.fullName,
        beforeState: before,
        afterState: lead.toObject(),
      })

      updated.push(leadId)
    }

    return ApiResponse.success(res, { updated: updated.length })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getLeads,
  
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  adminUpdateLead,
  adminReassignLead,
  adminUpdateLeadStatus,
  getCounsellors,
  importLeadsFromCsv,
  bulkAssignLeads,
}
