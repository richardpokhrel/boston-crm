const User = require('../models/User')
const { ApiResponse, ApiError } = require('../utils/apiHelpers')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  buildTokenPayload,
} = require('../utils/jwt')
const { cache } = require('../config/redis')
const env = require('../config/env')

const REFRESH_TOKEN_KEY = (userId) => `refresh:${userId}`
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}
const bcrypt = require('bcryptjs')

// POST /api/auth/register  (admin only in production)
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, phone, timezone } = req.body

    const existing = await User.findOne({ email })
    if (existing) throw ApiError.conflict('Email already in use')

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phone,
      timezone,
      createdBy: req.user?._id,
    })

    return ApiResponse.created(res, { user: user.toSafeObject() }, 'User created successfully')
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Fetch with password (select: false on schema)
    const user = await User.findOne({ email }).select('+password')
    if (!user) throw ApiError.unauthorized('Invalid credentials')
    if (!user.isActive) throw ApiError.unauthorized('Account deactivated')
    if (user.isLocked()) throw ApiError.unauthorized('Account locked. Try again later.')

    const isMatch =await bcrypt.compare(password, user.password)
    if (!isMatch) {
      // Increment failed count
      const failed = user.failedLoginCount + 1
      const update = { failedLoginCount: failed }
      if (failed >= 5) update.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 min lock
      await User.findByIdAndUpdate(user._id, update)
      throw ApiError.unauthorized('Invalid credentials')
    }

    // Reset failed count + update lastLoginAt
    await User.findByIdAndUpdate(user._id, {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    })

    const payload = buildTokenPayload(user)
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Store refresh token in Redis (7 days TTL)
    await cache.set(REFRESH_TOKEN_KEY(user._id), refreshToken, 7 * 24 * 60 * 60)

    // Send refresh token as httpOnly cookie
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS)

    // Determine redirect based on role
    let redirectTo = '/dashboard'
    if (user.role === 'student') {
      redirectTo = '/student/portal'
    }

    return ApiResponse.success(res, {
      accessToken,
      redirectTo,
      user: user.toSafeObject(),
    }, 'Login successful')
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token
    if (!token) throw ApiError.unauthorized('No refresh token')

    const decoded = verifyRefreshToken(token)

    // Verify it matches what we stored in Redis
    const stored = await cache.get(REFRESH_TOKEN_KEY(decoded.id))
    if (!stored || stored !== token) throw ApiError.unauthorized('Invalid refresh token')

    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) throw ApiError.unauthorized('User not found or inactive')

    const payload = buildTokenPayload(user)
    const newAccessToken = generateAccessToken(payload)

    return ApiResponse.success(res, { accessToken: newAccessToken }, 'Token refreshed')
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(ApiError.unauthorized('Refresh token expired'))
    next(err)
  }
}

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    // Blacklist current access token (until its natural expiry — ~15 min)
    if (req.token) {
      await cache.set(`blacklist:${req.token}`, '1', 15 * 60)
    }

    // Remove refresh token from Redis
    await cache.del(REFRESH_TOKEN_KEY(req.user._id))

    // Clear cookie
    res.clearCookie('refresh_token')

    return ApiResponse.success(res, {}, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    return ApiResponse.success(res, { user: req.user.toSafeObject() })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, refresh, logout, getMe }
