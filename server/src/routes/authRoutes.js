const router = require('express').Router()
const { register, login, refresh, logout, getMe } = require('../controllers/authController')
const { protect, adminOnly } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { registerSchema, loginSchema } = require('../validators/authValidators')
const { authLimiter } = require('../middleware/rateLimiter')

// Public
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/refresh', refresh)

// Protected
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)

// Admin only — create users
router.post('/register', protect, adminOnly, validate(registerSchema), register)

module.exports = router
