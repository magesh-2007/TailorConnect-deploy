import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { sendVerificationOtpEmail } from '../services/emailService.js'

const generateToken = (user) => {
  // Role ALWAYS comes from the database user record — never from the frontend
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

const formatUser = (user) => {
  const u = user.toObject ? user.toObject() : { ...user }
  const { password, ...rest } = u
  return {
    ...rest,
    id: u._id,
    profileImage: u.profileImage,
    isActive: u.isActive,
    isVerified: u.isVerified,
    emailVerified: Boolean(u.emailVerified || u.isVerified),
    emailVerifiedAt: u.emailVerifiedAt,
    googleId: u.googleId,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    // Role is normalised to lowercase so the frontend can use it directly
    // e.g. user.role === 'customer' for routing
    role: (u.role || '').toLowerCase()
  }
}

// ─── OTP Security Helpers ─────────────────────────────────────────────────────
export const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex')
}

export const generateSecureOtp = () => {
  // Cryptographically secure 6-digit random number (100000 - 999999)
  return crypto.randomInt(100000, 1000000).toString()
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
// Public registration is allowed only for CUSTOMER, STUDENT, and TAILOR.
// Generates a cryptographically secure 6-digit OTP, stores only the SHA-256 hash,
// and delivers the real OTP via Nodemailer SMTP.
export const register = async (req, res, next) => {
  try {
    const {
      name, email, username, password, role,
      phone, address, location,
      shopName, specialist, experience, age
    } = req.body

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required fields.', 400)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return sendError(res, 'Please provide a valid email address.', 400)
    }

    const requestedRole = (role || 'CUSTOMER').toUpperCase()

    // Block public registration for restricted roles
    if (['ADMIN', 'EMPLOYEE'].includes(requestedRole)) {
      return sendError(
        res,
        'Admin and Employee accounts cannot be created through public registration.',
        403
      )
    }

    if (!['CUSTOMER', 'TAILOR', 'STUDENT'].includes(requestedRole)) {
      return sendError(res, 'Invalid role. Must be CUSTOMER, TAILOR, or STUDENT.', 400)
    }

    const cleanEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: cleanEmail }).select('+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpLastSentAt')

    if (existing) {
      // If user already verified their email, block re-registration
      if (existing.emailVerified || existing.isVerified) {
        return sendError(res, 'An account with this email address already exists. Please log in.', 409)
      }

      // If user exists but is NOT verified: check 60s cooldown
      if (existing.emailOtpLastSentAt && (Date.now() - existing.emailOtpLastSentAt.getTime() < 60000)) {
        const remaining = Math.ceil((60000 - (Date.now() - existing.emailOtpLastSentAt.getTime())) / 1000)
        return sendError(
          res,
          `A verification code was recently sent. Please check your inbox or wait ${remaining}s before requesting a new code.`,
          429,
          { cooldownRemaining: remaining, email: cleanEmail, requiresVerification: true }
        )
      }

      // Update password & details for this pending registration
      const hashedPassword = await bcrypt.hash(password, 10)
      existing.name = name.trim()
      existing.password = hashedPassword
      existing.role = requestedRole
      if (phone) existing.phone = phone.trim()
      if (address) existing.address = address
      if (location) existing.location = location

      const otp = generateSecureOtp()
      existing.emailOtpHash = hashOtp(otp)
      existing.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      existing.emailOtpAttempts = 0
      existing.emailOtpLastSentAt = new Date()
      existing.emailVerified = false
      existing.isVerified = false
      await existing.save()

      try {
        await sendVerificationOtpEmail(cleanEmail, otp, existing.name)
      } catch (mailErr) {
        console.error('[Register] Failed to send OTP email:', mailErr.message)
        return sendError(res, `Failed to send verification email: ${mailErr.message}. Please check your SMTP settings in backend/.env`, 500)
      }

      return sendSuccess(
        res,
        'Registration initiated! A 6-digit verification code has been sent to your email.',
        {
          email: cleanEmail,
          requiresVerification: true,
          expiresIn: 300,
          cooldown: 60
        },
        201
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    let usernameVal = username
      ? username.toLowerCase().trim()
      : cleanEmail.split('@')[0].toLowerCase()

    // Ensure unique username to prevent duplicate key errors
    const existingUserByUsername = await User.findOne({ username: usernameVal })
    if (existingUserByUsername) {
      if (!username) {
        usernameVal = `${usernameVal}_${Math.floor(1000 + Math.random() * 9000)}`
      } else {
        return sendError(res, 'A user with this username already exists. Please choose a different username.', 409)
      }
    }

    const otp = generateSecureOtp()

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      username: usernameVal,
      password: hashedPassword,
      role: requestedRole,
      phone: phone ? phone.trim() : '',
      address: address || '',
      location: location || 'Chennai',
      age: age ? Number(age) : 25,
      emailVerified: false,
      isVerified: false,
      emailOtpHash: hashOtp(otp),
      emailOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      emailOtpAttempts: 0,
      emailOtpLastSentAt: new Date()
    })

    let tailorProfile = null
    if (requestedRole === 'TAILOR') {
      tailorProfile = await TailorProfile.create({
        userId: user._id,
        shopName: shopName || `${name}'s Fashion Studio`,
        shopLocation: location || 'Chennai',
        specialist: specialist || 'Bridal Blouse & Aari Work Specialist',
        experience: experience || '3 yrs'
      })
    }

    // Send real OTP email
    try {
      await sendVerificationOtpEmail(cleanEmail, otp, user.name)
    } catch (mailErr) {
      console.error('[Register] Failed to send OTP email:', mailErr.message)
      return sendError(
        res,
        `Account created, but email delivery failed: ${mailErr.message}. Please configure SMTP in backend/.env.`,
        500,
        { email: cleanEmail, requiresVerification: true }
      )
    }

    return sendSuccess(
      res,
      'Registration successful! A 6-digit verification code has been sent to your email.',
      {
        email: cleanEmail,
        requiresVerification: true,
        expiresIn: 300,
        cooldown: 60
      },
      201
    )
  } catch (err) {
    next(err)
  }
}

// ─── VERIFY EMAIL OTP ────────────────────────────────────────────────────────
// Atomically verifies the 6-digit OTP, marks email as verified, activates the account,
// and issues the initial session JWT token.
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return sendError(res, 'Email and 6-digit verification code are required.', 400)
    }

    const cleanOtp = String(otp).trim()
    if (!/^\d{6}$/.test(cleanOtp)) {
      return sendError(res, 'Verification code must be exactly 6 digits.', 400)
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: cleanEmail })
      .select('+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpLastSentAt')

    if (!user) {
      return sendError(res, 'No account found matching this email address.', 404)
    }

    if (user.emailVerified) {
      return sendSuccess(res, 'This email address is already verified. You can log in.', {
        alreadyVerified: true,
        user: formatUser(user),
        token: generateToken(user)
      })
    }

    // Check maximum attempts limit (max 5)
    if ((user.emailOtpAttempts || 0) >= 5) {
      return sendError(
        res,
        'Too many failed attempts. This OTP has been invalidated for security. Please request a new code.',
        429,
        { maxAttemptsReached: true }
      )
    }

    // Check expiration (5 minutes)
    if (!user.emailOtpExpiresAt || Date.now() > user.emailOtpExpiresAt.getTime()) {
      return sendError(
        res,
        'The verification code has expired. Please request a new code.',
        400,
        { expired: true }
      )
    }

    // Compare submitted OTP hash with stored hash using timing-safe comparison
    const submittedHash = hashOtp(cleanOtp)
    const storedHash = user.emailOtpHash || ''

    let isMatch = false
    try {
      if (storedHash && submittedHash.length === storedHash.length) {
        isMatch = crypto.timingSafeEqual(
          Buffer.from(submittedHash, 'hex'),
          Buffer.from(storedHash, 'hex')
        )
      }
    } catch {
      isMatch = false
    }

    if (!isMatch) {
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1
      await user.save()

      const remaining = 5 - user.emailOtpAttempts
      return sendError(
        res,
        `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt${remaining > 1 ? 's' : ''} remaining.` : 'Please request a new code.'}`,
        400,
        { attemptsRemaining: Math.max(0, remaining) }
      )
    }

    // OTP is valid! Atomically mark verified and clear OTP fields
    user.emailVerified = true
    user.emailVerifiedAt = new Date()
    user.isVerified = user.role !== 'TAILOR' // Tailors also require admin approval
    user.emailOtpHash = undefined
    user.emailOtpExpiresAt = undefined
    user.emailOtpAttempts = 0
    user.emailOtpLastSentAt = undefined
    await user.save()

    const token = generateToken(user)
    const userData = formatUser(user)

    let tailorProfile = null
    if (user.role === 'TAILOR') {
      tailorProfile = await TailorProfile.findOne({ userId: user._id })
    }

    return sendSuccess(
      res,
      'Email verified successfully! Your account is now active.',
      {
        user: userData,
        tailorProfile,
        token
      }
    )
  } catch (err) {
    next(err)
  }
}

// ─── RESEND OTP ──────────────────────────────────────────────────────────────
// Generates a fresh OTP and resends it, enforcing a 60-second cooldown period.
export const resendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return sendError(res, 'Email address is required.', 400)
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: cleanEmail })
      .select('+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpLastSentAt')

    if (!user) {
      return sendError(res, 'No account found matching this email address.', 404)
    }

    if (user.emailVerified) {
      return sendError(res, 'This email address is already verified. Please log in.', 400)
    }

    // Enforce 60-second cooldown
    if (user.emailOtpLastSentAt && (Date.now() - user.emailOtpLastSentAt.getTime() < 60000)) {
      const remainingSeconds = Math.ceil((60000 - (Date.now() - user.emailOtpLastSentAt.getTime())) / 1000)
      return sendError(
        res,
        `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
        429,
        { cooldownRemaining: remainingSeconds }
      )
    }

    const otp = generateSecureOtp()
    user.emailOtpHash = hashOtp(otp)
    user.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)
    user.emailOtpAttempts = 0
    user.emailOtpLastSentAt = new Date()
    await user.save()

    try {
      await sendVerificationOtpEmail(cleanEmail, otp, user.name)
    } catch (mailErr) {
      console.error('[Resend OTP] Failed to send email:', mailErr.message)
      return sendError(res, `Failed to send email: ${mailErr.message}. Check SMTP configuration.`, 500)
    }

    return sendSuccess(
      res,
      'A new verification code has been sent to your email address.',
      {
        email: cleanEmail,
        expiresIn: 300,
        cooldown: 60
      }
    )
  } catch (err) {
    next(err)
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// The user provides only their credentials (email/phone + password).
// The role is NEVER accepted from the frontend. It is always read from the
// authenticated user's MongoDB document and embedded in the JWT.
export const login = async (req, res, next) => {
  try {
    const { identifier, email, username, phone, password } = req.body
    const term = (identifier || email || username || phone || '').trim().toLowerCase()

    if (!term || !password) {
      return sendError(res, 'Please provide both your email/username and password.', 400)
    }

    // Find user by email, username, or phone
    const user = await User.findOne({
      $or: [{ email: term }, { username: term }, { phone: term }]
    })

    if (!user) {
      return sendError(res, 'No account found matching the provided credentials.', 401)
    }

    if (!user.password) {
      return sendError(
        res,
        'This account uses Google sign-in. Please use the "Continue with Google" button.',
        401
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return sendError(res, 'Incorrect password. Please verify your credentials and try again.', 401)
    }

    if (!user.isActive) {
      return sendError(
        res,
        'This account has been deactivated. Please contact platform support.',
        403
      )
    }

    // Enforce Email Verification: Block login if user email has not been verified
    // (Allow seeded accounts where isVerified === true and emailVerified !== false)
    if (user.emailVerified === false && !user.isVerified) {
      return sendError(
        res,
        'Your email address has not been verified yet. Please enter the verification OTP sent to your inbox.',
        403,
        {
          emailUnverified: true,
          email: user.email,
          requiresVerification: true
        }
      )
    }

    // Generate JWT with the role read directly from the database
    const token = generateToken(user)
    const userData = formatUser(user)

    // Attach tailor profile data when the authenticated user is a TAILOR
    if (user.role === 'TAILOR') {
      const tp = await TailorProfile.findOne({ userId: user._id })
      if (tp) {
        Object.assign(userData, {
          shopName: tp.shopName,
          shopLocation: tp.shopLocation,
          specialist: tp.specialist,
          experience: tp.experience,
          services: tp.services,
          rating: tp.rating,
          reviewCount: tp.reviewCount,
          verified: tp.verificationStatus === 'VERIFIED'
        })
      }
    }

    return sendSuccess(res, 'Login successful.', { user: userData, token })
  } catch (err) {
    next(err)
  }
}

// ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────────
// When a real Google OAuth token arrives, the backend verifies the Google
// identity, then looks up the user in MongoDB to get their actual role.
// For new Google sign-ups (first time), they are created as CUSTOMER.
// The frontend never passes a role — role always comes from the database.
export const googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId, profileImage } = req.body

    if (!email) {
      return sendError(res, 'Email is required for Google authentication.', 400)
    }

    const cleanEmail = email.toLowerCase().trim()

    // Look up existing user in MongoDB
    let user = await User.findOne({ email: cleanEmail })

    if (!user) {
      // New Google user → default to CUSTOMER
      let uniqueUsername = `google_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`
      let count = 0
      while (await User.findOne({ username: uniqueUsername }) && count < 10) {
        count++
        uniqueUsername = `google_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
      }

      let uniqueGoogleId = googleId || `google-oauth-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      if (await User.findOne({ googleId: uniqueGoogleId })) {
        uniqueGoogleId = `google-oauth-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`
      }

      user = await User.create({
        name: name || 'Google User',
        email: cleanEmail,
        username: uniqueUsername,
        role: 'CUSTOMER',
        googleId: uniqueGoogleId,
        profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        location: 'Chennai'
      })
    } else if (googleId && !user.googleId) {
      // Check if googleId is already linked to another account
      const existingGoogleUser = await User.findOne({ googleId })
      if (!existingGoogleUser) {
        user.googleId = googleId
        if (profileImage && !user.profileImage) user.profileImage = profileImage
        user.emailVerified = true
        user.emailVerifiedAt = user.emailVerifiedAt || new Date()
        await user.save()
      }
    } else if (!user.emailVerified) {
      user.emailVerified = true
      user.emailVerifiedAt = user.emailVerifiedAt || new Date()
      await user.save()
    }

    if (!user.isActive) {
      return sendError(res, 'This account has been deactivated. Please contact support.', 403)
    }

    // Role is read from the database — not from the request
    const token = generateToken(user)
    return sendSuccess(res, 'Google authentication successful.', {
      user: formatUser(user),
      token
    })
  } catch (err) {
    next(err)
  }
}

// ─── ME ───────────────────────────────────────────────────────────────────────
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return sendError(res, 'User not found.', 404)
    }

    const userData = formatUser(user)

    if (user.role === 'TAILOR') {
      const tp = await TailorProfile.findOne({ userId: user._id })
      if (tp) {
        Object.assign(userData, {
          shopName: tp.shopName,
          shopLocation: tp.shopLocation,
          specialist: tp.specialist,
          experience: tp.experience,
          services: tp.services,
          rating: tp.rating,
          reviewCount: tp.reviewCount,
          verified: tp.verificationStatus === 'VERIFIED',
          dailyCapacity: tp.dailyCapacity,
          urgentAvailable: tp.urgentAvailable
        })
      }
    }

    return sendSuccess(res, 'User profile retrieved successfully.', { user: userData })
  } catch (err) {
    next(err)
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  return sendSuccess(res, 'Logged out successfully.')
}

// ─── UPDATE ME (PATCH /api/auth/me) ──────────────────────────────────────────
// Lets any authenticated user update their own safe profile fields.
// Role, isActive, isVerified are NOT patchable from here.
export const updateMe = async (req, res, next) => {
  try {
    const ALLOWED = ['name', 'phone', 'address', 'location', 'profileImage', 'age']
    const updates = {}
    ALLOWED.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f]
    })

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'No valid fields provided to update.', 400)
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!user) return sendError(res, 'User not found.', 404)

    const userData = formatUser(user)

    if (user.role === 'TAILOR') {
      const tp = await TailorProfile.findOne({ userId: user._id })
      if (tp) {
        Object.assign(userData, {
          shopName: tp.shopName,
          shopLocation: tp.shopLocation,
          specialist: tp.specialist,
          experience: tp.experience,
          rating: tp.rating,
          reviewCount: tp.reviewCount,
          verified: tp.verificationStatus === 'VERIFIED'
        })
      }
    }

    return sendSuccess(res, 'Profile updated successfully.', { user: userData })
  } catch (err) {
    next(err)
  }
}
