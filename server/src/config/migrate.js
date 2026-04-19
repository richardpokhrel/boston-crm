const mongoose = require('mongoose')
const env = require('./env')
const logger = require('./logger')

const runMigrations = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    logger.info('Running database migrations...')

    // Drop the old 'id' index if it exists
    const Lead = mongoose.model('Lead')
    const collection = Lead.collection
    
    try {
      await collection.dropIndex('id_1')
      logger.info('✅ Dropped old id_1 index from leads collection')
    } catch (err) {
      if (err.code === 27) {
        // Index doesn't exist - this is fine
        logger.info('ℹ️  id_1 index does not exist (already dropped or never created)')
      } else {
        throw err
      }
    }

    logger.info('✅ All migrations completed')
    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    logger.error('❌ Migration failed:', err.message)
    process.exit(1)
  }
}

if (require.main === module) {
  runMigrations()
}

module.exports = runMigrations
