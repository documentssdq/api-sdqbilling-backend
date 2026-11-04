const Joi = require('joi');

module.exports = {
  createCity: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    country_id: Joi.string().required().messages({
      'string.empty': 'Country is required',
      'any.required': 'Country is required',
    }),
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'City name is required',
      'any.required': 'City name is required',
      'string.min': 'City name must be at least 1 character long',
    }),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateCity: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    country_id: Joi.string().optional(),
    name: Joi.string().trim().min(1).max(100).optional().messages({
      'string.empty': 'City name cannot be empty',
      'string.min': 'City name must be at least 1 character long',
    }),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
