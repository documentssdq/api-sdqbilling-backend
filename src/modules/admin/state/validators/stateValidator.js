const Joi = require('joi');

module.exports = {
  createState: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    country_id: Joi.alternatives().try(
      Joi.string().trim().min(1),
      Joi.object()
    ).required().messages({
      'string.empty': 'Country is required',
      'any.required': 'Country is required',
    }),
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'State name is required',
      'any.required': 'State name is required',
      'string.min': 'State name must be at least 1 character long',
    }),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateState: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    country_id: Joi.alternatives().try(
      Joi.string().trim().min(1),
      Joi.object()
    ).required().messages({
      'string.empty': 'Country is required',
      'any.required': 'Country is required',
    }),
    name: Joi.string().trim().min(1).max(100).optional().messages({
      'string.empty': 'State name cannot be empty',
      'string.min': 'State name must be at least 1 character long',
    }),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
