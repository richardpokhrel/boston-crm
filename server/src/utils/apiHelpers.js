// ── Standardised API response wrapper ─────────────────────────────────────
class ApiResponse {
  static success(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    })
  }

  static created(res, data = {}, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201)
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    })
  }
}

// ── Custom error class ─────────────────────────────────────────────────────
class ApiError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.isOperational = true // distinguish from programmer errors
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message, errors = []) {
    return new ApiError(message, 400, errors)
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401)
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403)
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404)
  }

  static conflict(message) {
    return new ApiError(message, 409)
  }

  static internal(message = 'Internal server error') {
    return new ApiError(message, 500)
  }
}

// ── Pagination helper ──────────────────────────────────────────────────────
const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page, 10))
  const l = Math.min(100, Math.max(1, parseInt(limit, 10)))
  return {
    skip: (p - 1) * l,
    limit: l,
    page: p,
  }
}

const paginationMeta = (total, page, limit) => ({
  total,
  page: parseInt(page, 10),
  limit: parseInt(limit, 10),
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
})

module.exports = { ApiResponse, ApiError, paginate, paginationMeta }
