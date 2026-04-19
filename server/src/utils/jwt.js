const jwt = require('jsonwebtoken')
const env = require('../config/env')


const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  })
}

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  })
}

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET)
}

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET)
}

// Build token payload from user document
const buildTokenPayload = (user) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role,
  fullName: user.fullName,
})

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildTokenPayload,
}
