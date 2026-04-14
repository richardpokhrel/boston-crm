const http = require('http')
const { Server: SocketServer } = require('socket.io')
const app = require('./app')
const connectDB = require('./config/db')
const { connectRedis } = require('./config/redis')
const env = require('./config/env')
const logger = require('./config/logger')

const bootstrap = async () => {
  // Connect to MongoDB and Redis
  await connectDB()
  await connectRedis()

  const httpServer = http.createServer(app)

  // ── Socket.io ────────────────────────────────────────────────────────────
  const io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  })

  // Store io on app for use in controllers
  app.set('io', io)

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`)

    // Join a room per user so we can emit to specific users
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`)
      logger.info(`Socket ${socket.id} joined room user:${userId}`)
    })

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`)
    })
  })

  // ── Start server ─────────────────────────────────────────────────────────
  httpServer.listen(env.PORT, () => {
    logger.info(`🚀  Server running on port ${env.PORT} [${env.NODE_ENV}]`)
    logger.info(`    API:    http://localhost:${env.PORT}/api`)
    logger.info(`    Health: http://localhost:${env.PORT}/health`)
  })

  // ── Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`)
    httpServer.close(() => {
      logger.info('HTTP server closed')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000) // Force exit after 10s
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
