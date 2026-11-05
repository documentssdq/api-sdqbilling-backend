const Joi = require('joi');

module.exports = {
  createCurrency: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Currency name is required',
      'any.required': 'Currency name is required',
      'string.min': 'Currency name must be at least 1 character long',
    }),
    code: Joi.string().trim().max(10).allow('', null).optional(),
    symbol: Joi.string().trim().max(10).allow('', null).optional(),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateCurrency: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).optional().messages({
      'string.empty': 'Currency name cannot be empty',
      'string.min': 'Currency name must be at least 1 character long',
    }),
    code: Joi.string().trim().max(10).allow('', null).optional(),
    symbol: Joi.string().trim().max(10).allow('', null).optional(),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
