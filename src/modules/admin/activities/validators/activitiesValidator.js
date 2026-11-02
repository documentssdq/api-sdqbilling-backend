const Joi = require('joi');

module.exports = {
  createActivities: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Name is required',
      'any.required': 'Name is required',
    }),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateActivities: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
