const router = require('express').Router()

router.use('/auth', require('./authRoutes'))
router.use('/leads', require('./leadRoutes'))
router.use('/users', require('./userRoutes'))

// Health check
router.get('/ping', (req, res) => res.json({ pong: true }))

module.exports = router
