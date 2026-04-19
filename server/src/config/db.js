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

    // Run migrations
    await runMigrations()
  } catch (err) {
    logger.error('❌  MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

const runMigrations = async () => {
  try {
    const Lead = mongoose.model('Lead')
    const collection = Lead.collection

    // Drop the old 'id' index if it exists
    try {
      await collection.dropIndex('id_1')
      logger.info('✅ Dropped old id_1 index from leads collection')
    } catch (err) {
      if (err.code === 27) {
        // Index doesn't exist - this is fine
        logger.debug('ℹ️  id_1 index does not exist (already dropped)')
      } else {
        throw err
      }
    }
  } catch (err) {
    logger.warn('Migration warning:', err.message)
    // Don't fail the entire connection if migrations have issues
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
