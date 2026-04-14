const Joi = require('joi')

const createLeadSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().min(7).max(20).required(),
  source: Joi.string()
    .valid('facebook', 'instagram', 'website', 'referral', 'manual', 'csv_import')
    .required(),
  utmCampaign: Joi.string().optional().allow(''),
  programInterest: Joi.string().optional().allow(''),
  destinationCountry: Joi.string().optional().allow(''),
  assignedCounsellor: Joi.string().hex().length(24).optional(),
})

const updateLeadSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  email: Joi.string().email().allow(''),
  phone: Joi.string().min(7).max(20),
  programInterest: Joi.string().allow(''),
  destinationCountry: Joi.string().allow(''),
  assignedCounsellor: Joi.string().hex().length(24).allow(null),
  qualificationNotes: Joi.string().allow(''),
})

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'new', 'contacted', 'interested', 'docs_received',
      'initial_docs_completed', 'pre_conditional', 'pre_enrolled', 'enrolled', 'lost'
    )
    .required(),
  reason: Joi.when('status', {
    is: 'lost',
    then: Joi.string().required().messages({ 'any.required': 'Reason is required when marking as lost' }),
    otherwise: Joi.string().optional().allow(''),
  }),
  reasonCategory: Joi.string()
    .valid('financial', 'unresponsive', 'not_interested', 'failed_interview', 'visa_refused', 'duplicate', 'withdrew', 'other')
    .optional(),
})

module.exports = { createLeadSchema, updateLeadSchema, updateStatusSchema }
