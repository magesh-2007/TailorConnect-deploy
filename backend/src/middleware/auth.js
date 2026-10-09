import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendError } from '../utils/response.js'

// ── Startup Guard ────────────────────────────────────────────────────────────
// Fail fast if JWT_SECRET is not configured. A hardcoded fallback is a serious
// security risk in production — always require the secret from the environment.
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error(
    '[auth middleware] JWT_SECRET is not set in the environment variables. ' +
    'Please add JWT_SECRET to your .env file before starting the server.'
  )
}

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No token provided.', 401)
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, JWT_SECRET)

    // Always fetch the user from the database — never trust the role in the JWT alone.
    // This ensures that if an admin deactivates or role-changes a user, the change
    // is reflected immediately without waiting for the JWT to expire.
    const user = await User.findById(decoded.id)

    if (!user) {
      return sendError(res, 'User associated with this token no longer exists.', 401)
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403)
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Your session has expired. Please log in again.', 401)
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please log in again.', 401)
    }
    return sendError(res, 'Authentication failed.', 401)
  }
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401)
    }

    const normalizedAllowed = roles.map((r) => r.toUpperCase())
    const userRole = (req.user.role || '').toUpperCase()

    if (!normalizedAllowed.includes(userRole)) {
      return sendError(
        res,
        `Access denied. Role "${userRole}" is not authorized to access this resource.`,
        403
      )
    }

    next()
  }
}

/** Check if a string is a valid MongoDB ObjectId */
export function isValidObjectId(str) {
  return /^[a-f\d]{24}$/i.test(str)
}

/** Kept for backward compat – controllers use this for route param checking */
export function isValidUUID(str) {
  return isValidObjectId(str)
}
