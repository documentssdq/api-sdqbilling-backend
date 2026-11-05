const Joi = require('joi');

const indianMobileRegex = /^(?:(?:\+91|91|0)[\s-]?)?[6-9]\d{9}$/;

module.exports = {
  createPartys: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Party name is required',
      'any.required': 'Party name is required',
      'string.min': 'Party name must be at least 1 character long',
    }),
    partyType: Joi.string().valid('customer', 'vendor', 'both').required().messages({
      'string.empty': 'Party type is required',
      'any.required': 'Party type is required',
      'any.only': 'Party type must be customer, vendor, or both',
    }),
    phone: Joi.string()
      .trim()
      .pattern(indianMobileRegex)
      .required()
      .messages({
        'string.empty': 'Phone / Mobile number is required',
        'any.required': 'Phone / Mobile number is required',
        'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)',
      }),
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        'string.empty': 'Email address is required',
        'any.required': 'Email address is required',
        'string.email': 'Please enter a valid email address',
      }),
    taxType: Joi.string().valid('GST', 'VAT').allow('', null).optional(),
    currency_id: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object()
    ).optional(),
    gstin: Joi.string().allow('', null).max(20).optional(),
    country_id: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object()
    ).optional(),
    city_id: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object()
    ).optional(),
    address: Joi.string().allow('', null).max(300).optional(),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updatePartys: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    name: Joi.string().trim().min(1).max(100).optional().messages({
      'string.empty': 'Party name cannot be empty',
      'string.min': 'Party name must be at least 1 character long',
    }),
    partyType: Joi.string().valid('customer', 'vendor', 'both').optional().messages({
      'string.empty': 'Party type cannot be empty',
      'any.only': 'Party type must be customer, vendor, or both',
    }),
    phone: Joi.string()
      .trim()
      .pattern(indianMobileRegex)
      .optional()
      .messages({
        'string.empty': 'Phone / Mobile number cannot be empty',
        'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)',
      }),
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .optional()
      .messages({
        'string.empty': 'Email address cannot be empty',
        'string.email': 'Please enter a valid email address',
      }),
    taxType: Joi.string().valid('GST', 'VAT').allow('', null).optional(),
    currency_id: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object()
    ).optional(),
    gstin: Joi.string().allow('', null).max(20).optional(),
    country_id: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object()
    ).optional(),
    city_id: Joi.alternatives().try(
      Joi.string().allow('', null),
      Joi.object()
    ).optional(),
    address: Joi.string().allow('', null).max(300).optional(),
    description: Joi.string().allow('', null).max(500).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
