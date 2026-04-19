import api from './axios'

export const leadsApi = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.patch(`/leads/${id}`, data),
  updateStatus: (id, data) => api.patch(`/leads/${id}/status`, data),
  addContactAttempt: (id, data) => api.post(`/leads/${id}/contact-attempt`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  
  // Admin endpoints
  getCounsellors: () => api.get('/leads/admin/counsellors'),

  //
  importCsv: (file, assignmentStrategy, assignedCounsellor) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('assignmentStrategy', assignmentStrategy)
    if (assignedCounsellor) {
      formData.append('assignedCounsellor', assignedCounsellor)
    }
    return api.post('/leads/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  //
  bulkAssign: (leadIds, assignmentStrategy, assignedCounsellor) =>
    api.post('/leads/bulk-assign', { leadIds, assignmentStrategy, assignedCounsellor }),
  adminUpdateLead: (id, data) => api.patch(`/leads/${id}/admin`, data),
  adminReassignLead: (id, assignedCounsellor) =>
    api.patch(`/leads/${id}/admin/reassign`, { assignedCounsellor }),
  adminUpdateLeadStatus: (id, data) => api.patch(`/leads/${id}/admin/status`, data),
}
