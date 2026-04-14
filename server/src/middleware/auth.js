const { verifyAccessToken } = require('../utils/jwt')
const { ApiError } = require('../utils/apiHelpers')
const User = require('../models/User')
const { cache } = require('../config/redis')

// ── Protect route — verify JWT ─────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token

    // Accept token from Authorization header OR cookie
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.access_token) {
      token = req.cookies.access_token
    }

    if (!token) {
      return next(ApiError.unauthorized('No token provided'))
    }

    // Check if token is blacklisted (logged-out tokens stored in Redis)
    const isBlacklisted = await cache.exists(`blacklist:${token}`)
    if (isBlacklisted) {
      return next(ApiError.unauthorized('Token has been revoked'))
    }

    // Verify token
    const decoded = verifyAccessToken(token)

    // Attach user to request (fresh from DB to get latest role/active status)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return next(ApiError.unauthorized('User no longer exists'))
    }
    if (!user.isActive) {
      return next(ApiError.unauthorized('Account has been deactivated'))
    }
    if (user.isLocked()) {
      return next(ApiError.unauthorized('Account is temporarily locked'))
    }

    req.user = user
    req.token = token

    // Update lastActiveAt non-blocking (fire and forget)
    User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() }).exec()

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'))
    }
    if (err.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'))
    }
    next(err)
  }
}

// ── Role-based access control ──────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not allowed to access this resource`
        )
      )
    }
    next()
  }
}

// Shorthand role helpers
const adminOnly = authorize('admin')
const staffOnly = authorize('admin', 'counsellor', 'docs_team', 'app_team', 'interview_team', 'visa_team')

module.exports = { protect, authorize, adminOnly, staffOnly }
