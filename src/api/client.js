import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const isAuthRequest = config.url?.includes('/auth/')
  const token = localStorage.getItem('pawpal_token')
  if (token && !isAuthRequest) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (details) => api.post('/auth/register', details),
  requestPasswordReset: (email) => api.post('/auth/password-reset', { email }),
  verifyPasswordResetOtp: (payload) => api.post('/auth/password-reset/verify', payload),
  completePasswordReset: (payload) => api.post('/auth/password-reset/complete', payload),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
  save: (dashboard) => api.put('/dashboard', dashboard),
}

export const documentsApi = {
  get: () => api.get('/documents'),
  create: (payload) => api.post('/documents', payload),
  remove: (id) => api.delete(`/documents/${id}`),
}

export default api
