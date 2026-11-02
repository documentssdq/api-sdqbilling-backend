const Joi = require('joi');

module.exports = {
  createCategorys: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Name is required',
      'any.required': 'Name is required',
      'string.min': 'Name must be at least 1 character long',
    }),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateCategorys: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).optional().messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
    }),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
