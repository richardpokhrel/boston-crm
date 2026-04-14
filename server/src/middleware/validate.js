const { ApiError } = require('../utils/apiHelpers')

// Wraps a Joi schema and validates req.body, req.params, or req.query
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // collect all errors, not just first
      stripUnknown: true,  // remove unknown fields
      convert: true,
    })

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/['"]/g, ''))
      return next(ApiError.badRequest('Validation failed', messages))
    }

    req[source] = value // replace with sanitised value
    next()
  }
}

module.exports = { validate }
