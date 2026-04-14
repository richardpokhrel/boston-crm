require('dotenv').config()

const required = [
  'MONGO_URI',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
]

const missing = required.filter((k) => !process.env[k])
if (missing.length > 0) {
  console.error('❌  Missing required environment variables:')
  missing.forEach((k) => console.error(`   - ${k}`))
  process.exit(1)
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  MONGO_URI: process.env.MONGO_URI,

  REDIS_URL: process.env.REDIS_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',

  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@bostoncrm.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Boston CRM',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
}
