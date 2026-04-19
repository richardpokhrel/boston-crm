import api from './axios'

export const authApi = {
  login: async (data) => {
    const res = await api.post('/auth/login', data)
    return res.data
  },
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  register: (data) => api.post('/auth/register', data),
}
