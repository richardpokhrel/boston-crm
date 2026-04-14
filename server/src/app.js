const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const env = require('./config/env')
const { errorHandler, notFound } = require('./middleware/errorHandler')
const { apiLimiter } = require('./middleware/rateLimiter')

const app = express()

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Parsing & compression ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compression())

// ── HTTP logging ───────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() })
})

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, require('./routes'))

// ── 404 + Error handler (must be last) ────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

module.exports = app
