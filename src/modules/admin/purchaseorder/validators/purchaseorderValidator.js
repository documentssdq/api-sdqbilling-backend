const Joi = require('joi');

const itemSchema = Joi.object({
  id: Joi.any().optional(),
  _id: Joi.any().optional(),
  service_id: Joi.alternatives().try(Joi.string().required(), Joi.object().required()).messages({
    'any.required': 'Service is required for each item',
  }),
  quantity: Joi.number().min(0.0001).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be greater than 0',
  }),
  unit_id: Joi.alternatives().try(Joi.string().required(), Joi.object().required()).messages({
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
  createPurchaseorder: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    purchase_order_no: Joi.string().trim().allow('', null).optional(),
    purchase_no: Joi.string().trim().allow('', null).optional(),
    vendor_id: Joi.alternatives().try(Joi.string().required(), Joi.object().required()).messages({
      'string.empty': 'Vendor is required',
      'any.required': 'Vendor is required',
    }),
    invoice_date: Joi.alternatives().try(Joi.date(), Joi.string()).required().messages({
      'any.required': 'Order date is required',
    }),
    order_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
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
      'array.min': 'At least one item is required in purchase order details',
      'any.required': 'Purchase order items are required',
    }),
    isActive: Joi.boolean().optional(),
  }).unknown(true),

  updatePurchaseorder: Joi.object({
    id: Joi.string().allow('', null).optional(),
    _id: Joi.any().optional(),
    purchase_order_no: Joi.string().trim().optional(),
    purchase_no: Joi.string().trim().optional(),
    vendor_id: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
    invoice_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
    order_date: Joi.alternatives().try(Joi.date(), Joi.string()).allow('', null).optional(),
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
