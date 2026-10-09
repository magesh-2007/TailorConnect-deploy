import express from 'express'
import {
  register,
  login,
  googleLogin,
  verifyEmailOtp,
  resendEmailOtp,
  me,
  updateMe,
  logout
} from '../controllers/authController.js'
import { authenticateUser } from '../middleware/auth.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.post('/register',         authRateLimiter, register)
router.post('/login',            authRateLimiter, login)
router.post('/verify-email-otp', authRateLimiter, verifyEmailOtp)
router.post('/resend-otp',       authRateLimiter, resendEmailOtp)
router.post('/send-otp',         authRateLimiter, resendEmailOtp)
router.post('/google',           authRateLimiter, googleLogin)
router.post('/logout',           logout)
router.get('/me',                authenticateUser, me)
router.patch('/me',              authenticateUser, updateMe)

export default router

