const Joi = require('joi');

module.exports = {
  createSmstemplate: Joi.object({
    title: Joi.string().required(),
    unique_code: Joi.string().required(),
    subject: Joi.string().optional().allow(''),
    template_id: Joi.string().required(),
    message: Joi.string().required(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateSmstemplate: Joi.object({
    title: Joi.string().optional(),
    unique_code: Joi.string().optional(),
    subject: Joi.string().optional().allow(''),
    template_id: Joi.string().optional(),
    message: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
