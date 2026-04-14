const { createClient } = require('redis')
const IORedis = require('ioredis')
const env = require('./env')
const logger = require('./logger')

// ── Standard Redis client (cache) ─────────────────────────────────────────
const redisClient = createClient({ url: env.REDIS_URL })

redisClient.on('error', (err) => logger.error('Redis error:', err))
redisClient.on('connect', () => logger.info('✅  Redis connected'))

const connectRedis = async () => {
  await redisClient.connect()
}

// ── IORedis client (BullMQ requires ioredis) ──────────────────────────────
const bullRedis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,
})

// ── Cache helpers ─────────────────────────────────────────────────────────
const cache = {
  async get(key) {
    const val = await redisClient.get(key)
    return val ? JSON.parse(val) : null
  },

  async set(key, value, ttlSeconds = 300) {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value))
  },

  async del(key) {
    await redisClient.del(key)
  },

  async delPattern(pattern) {
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) await redisClient.del(keys)
  },

  async exists(key) {
    return (await redisClient.exists(key)) === 1
  },
}

module.exports = { redisClient, bullRedis, connectRedis, cache }
