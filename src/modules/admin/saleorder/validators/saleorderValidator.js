const Joi = require('joi');

const itemSchema = Joi.object({
  id: Joi.any().optional(),
  _id: Joi.any().optional(),
  service_id: Joi.alternatives().try(Joi.string().min(1), Joi.object()).required().messages({
    'any.required': 'Service is required for each item',
  }),
  quantity: Joi.number().min(0.0001).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be greater than 0',
  }),
  unit_id: Joi.alternatives().try(Joi.string().min(1), Joi.object()).required().messages({
    'any.required': 'Unit is required for each item',
  }),
  rate: Joi.number().min(0).required().messages({
    'any.required': 'Rate is required',
  }),
  discount: Joi.number().min(0).allow('', null).default(0).optional(),
  total: Joi.number().required().messages({
    'any.required': 'Total is required',
  }),
}).unknown(true);

module.exports = {
  createSaleorder: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    sale_order_no: Joi.string().trim().allow('', null).optional(),
    sale_no: Joi.string().trim().allow('', null).optional(),
    customer_id: Joi.alternatives().try(Joi.string().min(1), Joi.object()).required().messages({
      'string.empty': 'Customer is required',
      'any.required': 'Customer is required',
    }),
    invoice_date: Joi.alternatives().try(Joi.date(), Joi.string()).required().messages({
      'any.required': 'Order date is required',
    }),
    order_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    challan_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    fin_year: Joi.string().trim().allow('', null).optional(),
    due_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    invoice_no: Joi.string().trim().allow('', null).optional(),
    reference_no: Joi.string().trim().allow('', null).optional(),
    currency_id: Joi.alternatives().try(Joi.string(), Joi.object()).allow('', null).optional(),
    tax_type: Joi.string().allow('', null).optional(),
    tax_percentage: Joi.number().min(0).allow('', null).optional(),
    total_amount: Joi.number().allow('', null).optional(),
    discount_type: Joi.string().valid('fixed', 'percentage').optional(),
    discount: Joi.number().allow('', null).optional(),
    discount_amount: Joi.number().allow('', null).optional(),
    tax_amount: Joi.number().allow('', null).optional(),
    round_off: Joi.number().allow('', null).optional(),
    final_amount: Joi.number().allow('', null).optional(),
    remarks: Joi.string().allow('', null).max(1000).optional(),
    items: Joi.array().items(itemSchema).min(1).required().messages({
      'array.min': 'At least one item is required in sale order details',
      'any.required': 'Sale order items are required',
    }),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updateSaleorder: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    sale_order_no: Joi.string().trim().optional(),
    sale_no: Joi.string().trim().optional(),
    customer_id: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
    invoice_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    order_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    challan_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    fin_year: Joi.string().trim().allow('', null).optional(),
    due_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    invoice_no: Joi.string().trim().allow('', null).optional(),
    reference_no: Joi.string().trim().allow('', null).optional(),
    currency_id: Joi.alternatives().try(Joi.string(), Joi.object()).allow('', null).optional(),
    tax_type: Joi.string().allow('', null).optional(),
    tax_percentage: Joi.number().min(0).allow('', null).optional(),
    total_amount: Joi.number().allow('', null).optional(),
    discount_type: Joi.string().valid('fixed', 'percentage').optional(),
    discount: Joi.number().allow('', null).optional(),
    discount_amount: Joi.number().allow('', null).optional(),
    tax_amount: Joi.number().allow('', null).optional(),
    round_off: Joi.number().allow('', null).optional(),
    final_amount: Joi.number().allow('', null).optional(),
    remarks: Joi.string().allow('', null).max(1000).optional(),
    items: Joi.array().items(itemSchema).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
};
