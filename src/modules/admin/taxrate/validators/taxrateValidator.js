const Joi = require('joi');

module.exports = {
  createTaxrate: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Tax rate name is required',
      'any.required': 'Tax rate name is required',
      'string.min': 'Name must be at least 1 character long',
    }),
    rate: Joi.number().min(0).max(100).required().messages({
      'number.base': 'Tax rate must be a valid number',
      'number.min': 'Tax rate cannot be negative',
      'number.max': 'Tax rate cannot exceed 100%',
      'any.required': 'Tax rate percentage is required',
    }),
    taxType: Joi.string().valid('GST', 'VAT').default('GST').optional(),
    isDefault: Joi.boolean().optional(),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateTaxrate: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).optional().messages({
      'string.empty': 'Tax rate name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
    }),
    rate: Joi.number().min(0).max(100).optional().messages({
      'number.base': 'Tax rate must be a valid number',
      'number.min': 'Tax rate cannot be negative',
      'number.max': 'Tax rate cannot exceed 100%',
    }),
    taxType: Joi.string().valid('GST', 'VAT').optional(),
    isDefault: Joi.boolean().optional(),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
