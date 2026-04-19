
import api from './axios'

export const documentsApi = {
  // Get all documents for a lead
  getLeadDocuments: (leadId, params) =>
    api.get(`/documents/lead/${leadId}`, { params }),

  // Upload a new document
  uploadDocument: (leadId, file, documentType, title, description, expiryDate) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('leadId', leadId)
    formData.append('documentType', documentType)
    formData.append('title', title)
    if (description) formData.append('description', description)
    if (expiryDate) formData.append('expiryDate', expiryDate)
    return api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Update document status
  updateStatus: (id, data) => api.patch(`/documents/${id}`, data),

  // Delete a document
  deleteDocument: (id) => api.delete(`/documents/${id}`),

  // Download a document
  downloadDocument: (id) => api.get(`/documents/${id}/download`),
}
