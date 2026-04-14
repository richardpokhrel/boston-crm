const mongoose = require('mongoose')
const env = require('./env')
const logger = require('./logger')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      // Mongoose 8 uses these defaults — listed for clarity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    logger.info(`✅  MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    logger.error('❌  MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

// Reconnect on disconnect
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected — attempting reconnect...')
})

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err)
})

module.exports = connectDB
