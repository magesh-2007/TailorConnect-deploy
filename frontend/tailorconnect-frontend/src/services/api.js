import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attach the JWT Bearer token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tc_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ─────────────────────────────────────────────────────
// When the server returns 401 (token expired / invalid), automatically clear
// the local session and redirect to the login page so the user is never stuck
// in a broken auth state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored session data
      localStorage.removeItem('tc_token')
      localStorage.removeItem('tc_user')

      // Redirect to login — detect admin routes so admins go to /admin/login
      const currentPath = window.location.pathname
      const isAdminPath = currentPath.startsWith('/admin')
      const loginPath = isAdminPath ? '/admin/login' : '/login'

      // Only redirect if not already on a login/auth page
      const authPages = ['/login', '/register', '/admin/login', '/forgot-password', '/home', '/']
      const isAlreadyOnAuthPage = authPages.some((p) => currentPath === p || currentPath.startsWith(p + '/'))

      if (!isAlreadyOnAuthPage) {
        window.location.href = loginPath
      }
    }
    return Promise.reject(error)
  }
)

export default api
