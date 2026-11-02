const Joi = require('joi');

module.exports = {
  createPage: Joi.object({
    pageName: Joi.string().min(3).max(100).required(),
    slug: Joi.string().trim(),
    content: Joi.string().allow('').max(5000),
    metaTitle: Joi.string().allow('').max(255),
    metaDescription: Joi.string().allow('').max(500),
    metaKeyword: Joi.string().allow('').max(500),
    metaKeywords: Joi.string().allow('').max(500),
    image: Joi.string().allow(''),
    template: Joi.string().allow(''),
    externalUrl: Joi.string().allow(''),
    widgets: Joi.array(),
    isActive: Joi.boolean(),
  }).unknown(true),

  updatePage: Joi.object({
    pageName: Joi.string().min(3).max(100).optional(),
    slug: Joi.string().trim().optional(),
    content: Joi.string().allow('').max(5000).optional(),
    metaTitle: Joi.string().allow('').max(255).optional(),
    metaDescription: Joi.string().allow('').max(500).optional(),
    metaKeyword: Joi.string().allow('').max(500).optional(),
    metaKeywords: Joi.string().allow('').max(500).optional(),
    image: Joi.string().allow('').optional(),
    template: Joi.string().allow('').optional(),
    externalUrl: Joi.string().allow('').optional(),
    widgets: Joi.array().optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
