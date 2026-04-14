const router = require('express').Router()
const multer = require('multer')
const {
  getLeads, getLeadById, createLead, updateLead, updateLeadStatus, deleteLead,
  adminUpdateLead, adminReassignLead, adminUpdateLeadStatus,
  getCounsellors, importLeadsFromCsv, bulkAssignLeads,
} = require('../controllers/leadController')
const { protect, authorize, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { createLeadSchema, updateLeadSchema, updateStatusSchema } = require('../validators/leadValidators')

const upload = multer({ storage: multer.memoryStorage() })

// All routes require auth
router.use(protect)

// Admin endpoints (must come before /:id routes)
router.get('/admin/counsellors', adminOnly, getCounsellors)
router.post('/import/csv', adminOnly, upload.single('file'), importLeadsFromCsv)
router.post('/bulk-assign', adminOnly, bulkAssignLeads)

// Public endpoints
router.get('/', getLeads)
router.post('/', validate(createLeadSchema), createLead)
router.get('/:id', getLeadById)
router.patch('/:id', validate(updateLeadSchema), updateLead)
router.patch('/:id/status', validate(updateStatusSchema), updateLeadStatus)
router.patch('/:id/admin', adminOnly, adminUpdateLead)
router.patch('/:id/admin/reassign', adminOnly, adminReassignLead)
router.patch('/:id/admin/status', adminOnly, adminUpdateLeadStatus)
router.delete('/:id', adminOnly, deleteLead)

module.exports = router
