const logger = require('../config/logger')
const { ApiError } = require('../utils/apiHelpers')

// ── Global error handler — must be last middleware in Express ──────────────
const errorHandler = (err, req, res, next) => {
  let error = err

  // Wrap non-ApiError into ApiError
  if (!(error instanceof ApiError)) {
    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field'
      error = ApiError.conflict(`${field} already exists`)
    }
    // Mongoose validation error
    else if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      error = ApiError.badRequest('Validation failed', messages)
    }
    // Mongoose cast error (invalid ObjectId)
    else if (err.name === 'CastError') {
      error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`)
    }
    // Default 500
    else {
      error = new ApiError(
        process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        500
      )
    }
  }

  // Log server errors
  if (error.statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      userId: req.user?._id,
    })
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// ── 404 handler — place before errorHandler ────────────────────────────────
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

module.exports = { errorHandler, notFound }
