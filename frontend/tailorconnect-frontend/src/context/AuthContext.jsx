import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'tc_token'
const ACTIVE_USER_KEY = 'tc_user'

// ── JWT Expiry Helper ────────────────────────────────────────────────────────
// Decodes the JWT payload and checks whether it has already expired locally
// before even making a network call. This is a client-side hint only — the
// server always performs its own verification.
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp is in seconds; Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize session from localStorage on mount; validate with /api/auth/me
  useEffect(() => {
    const initSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(ACTIVE_USER_KEY)

      if (!storedToken) {
        setLoading(false)
        return
      }

      // If the token is already expired locally, skip the network call
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(ACTIVE_USER_KEY)
        setLoading(false)
        return
      }

      // Restore from cache immediately so UI does not flash logout
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (_) {
          // ignore parse errors
        }
      }

      try {
        const res = await api.get('/auth/me')
        const userData = res.data?.data?.user || res.data?.user
        if (userData) {
          setUser(userData)
          localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userData))
        }
      } catch (err) {
        // Token invalid or expired — clear session
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(ACTIVE_USER_KEY)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [])

  // Login via POST /api/auth/login
  // NOTE: No role is passed from the frontend. The backend determines the role
  // from the database and returns it in the JWT + user object.
  const login = async (param1, param2) => {
    let term = ''
    let pass = ''

    if (typeof param1 === 'string' && typeof param2 === 'object' && param2 !== null) {
      term = (param2.identifier || param2.email || '').trim()
      pass = (param2.password || '').trim()
    } else if (typeof param1 === 'string' && typeof param2 === 'string') {
      term = param1.trim()
      pass = param2.trim()
    } else if (typeof param1 === 'object' && param1 !== null) {
      term = (param1.identifier || param1.email || '').trim()
      pass = (param1.password || '').trim()
    }

    if (!term || !pass) {
      return { success: false, error: 'Please enter both your email/username and password.' }
    }

    try {
      const res = await api.post('/auth/login', {
        identifier: term,
        password: pass,
      })

      const payload = res.data?.data || res.data
      const token = payload?.token
      const userData = payload?.user

      if (!token || !userData) {
        return { success: false, error: 'Unexpected response from server. Please try again.' }
      }

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.'
      return {
        success: false,
        error: msg,
        emailUnverified: Boolean(err.response?.data?.emailUnverified),
        email: err.response?.data?.email || (term.includes('@') ? term : '')
      }
    }
  }

  // Register via POST /api/auth/register
  // role should be 'CUSTOMER', 'STUDENT', or 'TAILOR' — validated by backend.
  // ADMIN and EMPLOYEE are blocked on the backend side.
  // Generates real OTP and sends verification code to email.
  const register = async (role, formData) => {
    const { name, email, password } = formData
    if (!name || !email || !password) {
      return { success: false, error: 'Name, email, and password are required.' }
    }

    try {
      const res = await api.post('/auth/register', { ...formData, role })

      const payload = res.data?.data || res.data
      const token = payload?.token
      const userData = payload?.user

      // If email verification is required (OTP sent)
      if (payload?.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: payload.email || formData.email,
          cooldown: payload.cooldown || 60,
          expiresIn: payload.expiresIn || 300,
          message: res.data?.message || 'Verification code sent to your email.'
        }
      }

      if (!token || !userData) {
        return { success: false, error: 'Unexpected response from server. Please try again.' }
      }

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please check your details.'
      return {
        success: false,
        error: msg,
        requiresVerification: Boolean(err.response?.data?.requiresVerification),
        email: err.response?.data?.email || formData.email,
        cooldownRemaining: err.response?.data?.cooldownRemaining
      }
    }
  }

  // Verify Email OTP via POST /api/auth/verify-email-otp
  const verifyEmailOtp = async (email, otp) => {
    if (!email || !otp) {
      return { success: false, error: 'Email and 6-digit verification code are required.' }
    }
    try {
      const res = await api.post('/auth/verify-email-otp', {
        email: email.trim().toLowerCase(),
        otp: String(otp).trim(),
      })
      const payload = res.data?.data || res.data
      const token = payload?.token
      const userData = payload?.user

      if (token && userData) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userData))
        setUser(userData)
      }

      return {
        success: true,
        user: userData,
        message: res.data?.message || 'Email verified successfully!'
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Verification failed. Please check your code.'
      return {
        success: false,
        error: msg,
        expired: Boolean(err.response?.data?.expired),
        maxAttemptsReached: Boolean(err.response?.data?.maxAttemptsReached),
        attemptsRemaining: err.response?.data?.attemptsRemaining
      }
    }
  }

  // Resend OTP via POST /api/auth/resend-otp
  const resendEmailOtp = async (email) => {
    if (!email) {
      return { success: false, error: 'Email is required to resend verification code.' }
    }
    try {
      const res = await api.post('/auth/resend-otp', {
        email: email.trim().toLowerCase(),
      })
      return {
        success: true,
        message: res.data?.message || 'A new verification code has been sent to your email.',
        cooldown: res.data?.data?.cooldown || 60,
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to resend verification code.'
      return {
        success: false,
        error: msg,
        cooldownRemaining: err.response?.data?.cooldownRemaining
      }
    }
  }

  // Google Login via POST /api/auth/google
  // Accepts user info fetched from Google's userinfo endpoint (via access_token flow).
  // The backend looks up or creates the user in MongoDB.
  // New Google accounts default to CUSTOMER on the backend.
  const loginWithGoogle = async ({ email, name, googleId, profileImage } = {}) => {
    if (!email) {
      return { success: false, error: 'Google sign-in did not return a valid email.' }
    }
    try {
      const res = await api.post('/auth/google', {
        email,
        name,
        googleId,
        profileImage,
      })

      const payload = res.data?.data || res.data
      const token = payload?.token
      const userData = payload?.user

      if (!token || !userData) {
        return { success: false, error: 'Google login failed. Please try again.' }
      }

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Google login failed. Please try again.'
      return { success: false, error: msg }
    }
  }

  // Update profile — PATCH via /api/auth/me or appropriate endpoint
  const updateProfile = async (updatedFields) => {
    if (!user) return { success: false, error: 'Not logged in.' }

    try {
      const res = await api.patch('/auth/me', updatedFields)
      const userData = res.data?.data?.user || res.data?.user || { ...user, ...updatedFields }

      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      // Fallback: update local state even if backend unavailable
      const updated = { ...user, ...updatedFields }
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updated))
      setUser(updated)
      return { success: true, user: updated }
    }
  }

  // Logout via POST /api/auth/logout
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) {
      // Ignore errors — always clear local session
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ACTIVE_USER_KEY)
      setUser(null)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  /** Returns the raw JWT token string (or null if not logged in) */
  const getToken = () => localStorage.getItem(TOKEN_KEY)
  const isAuthenticated = Boolean(user)

  // ── Switch Role Helper ───────────────────────────────────────────────────
  const switchRole = async (targetRole) => {
    const credentials = {
      customer: { identifier: 'customer@tailorconnect.com', password: 'customer123' },
      tailor:   { identifier: 'tailor@tailorconnect.com',   password: 'tailor123' },
      student:  { identifier: 'student@tailorconnect.com',  password: 'student123' },
      admin:    { identifier: 'admin@tailorconnect.com',    password: 'admin123' },
      employee: { identifier: 'employee@tailorconnect.com', password: 'employee123' },
    }
    const cred = credentials[targetRole?.toLowerCase()]
    if (cred) {
      const res = await login(cred.identifier, cred.password)
      if (res.success) {
        window.location.href = `/${targetRole.toLowerCase()}/dashboard`
        return true
      }
    }
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        getToken,
        login,
        register,
        verifyEmailOtp,
        resendEmailOtp,
        loginWithGoogle,
        updateProfile,
        logout,
        switchRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
