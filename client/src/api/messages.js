import api from './axios'

export const messagesApi = {
  // Get all messages for a lead
  getLeadMessages: (leadId) => api.get(`/messages/lead/${leadId}`),

  // Send a message
  sendMessage: (leadId, data) =>
    api.post('/messages', {
      leadId,
      ...data,
    }),

  // Mark message as read
  markAsRead: (id) => api.patch(`/messages/${id}/read`),

  // Pin/unpin message
  togglePin: (id) => api.patch(`/messages/${id}/pin`),

  // Delete message
  delete: (id) => api.delete(`/messages/${id}`),

  // Get unread count
  getUnreadCount: () => api.get('/messages/unread/count'),
}
