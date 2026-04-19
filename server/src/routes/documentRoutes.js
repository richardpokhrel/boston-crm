const router = require('express').Router()
const multer = require('multer')
const {
  getAllDocuments,
  getLeadDocuments,
  uploadDocument,
  updateDocumentStatus,
  deleteDocument,
  downloadDocument,
} = require('../controllers/documentController')
const { protect, authorize, adminOnly } = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage() })

// All routes require auth
router.use(protect)

// More specific routes first
// Download document
router.get('/:id/download', downloadDocument)

// Get all documents (everyone can view)
router.get('/', getAllDocuments)

// Get documents for a specific lead
router.get('/lead/:leadId', getLeadDocuments)

// Upload document (admin & student only)
router.post('/', upload.single('file'), uploadDocument)

// Update document status (admin & student only)
router.patch('/:id', updateDocumentStatus)

// Delete document (admin & student only)
router.delete('/:id', deleteDocument)

module.exports = router
