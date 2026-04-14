const Joi = require('joi')

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and a number',
    }),
  phone: Joi.string().optional(),
  role: Joi.string()
    .valid('admin', 'counsellor', 'docs_team', 'app_team', 'interview_team', 'visa_team', 'student')
    .required(),
  timezone: Joi.string().optional(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
})

module.exports = { registerSchema, loginSchema, changePasswordSchema }
