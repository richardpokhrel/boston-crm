const router = require('express').Router()

router.use('/auth', require('./authRoutes'))
router.use('/leads', require('./leadRoutes'))
router.use('/users', require('./userRoutes'))
router.use('/documents', require('./documentRoutes'))
router.use('/messages', require('./messageRoutes'))

// Health check
router.get('/ping', (req, res) => res.json({ pong: true }))

module.exports = router
