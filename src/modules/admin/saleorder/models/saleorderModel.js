const mongoose = require('mongoose');

const saleorderSchema = new mongoose.Schema(
  {
    sale_order_no: {
      type: String,
      required: [true, 'Sale order number is required'],
      trim: true,
      unique: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partys',
      required: [true, 'Customer is required'],
    },
    invoice_date: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now,
    },
    challan_date: {
      type: Date,
      default: null,
    },
    fin_year: {
      type: String,
      required: [true, 'Financial year is required'],
      trim: true,
      index: true,
    },
    due_date: {
      type: Date,
      default: null,
    },
    invoice_no: {
      type: String,
      trim: true,
      default: '',
    },
    currency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Currency',
      default: null,
    },
    tax_type: {
      type: String,
      enum: ['GST', 'VAT', 'None', ''],
      default: 'GST',
    },
    tax_percentage: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    discount_type: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'fixed',
    },
    discount: {
      type: Number,
      default: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
    },
    round_off: {
      type: Number,
      default: 0,
    },
    final_amount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'saleorder',
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.sale_order_no && ret.sale_no) ret.sale_order_no = ret.sale_no;
        if (!ret.sale_no && ret.sale_order_no) ret.sale_no = ret.sale_order_no;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.sale_order_no && ret.sale_no) ret.sale_order_no = ret.sale_no;
        if (!ret.sale_no && ret.sale_order_no) ret.sale_no = ret.sale_order_no;
        return ret;
      },
    },
  }
);

// Virtual alias sale_no for backward/unified compatibility
saleorderSchema.virtual('sale_no').get(function () {
  return this.sale_order_no;
}).set(function (val) {
  this.sale_order_no = val;
});

// Virtual alias order_date for invoice_date
saleorderSchema.virtual('order_date').get(function () {
  return this.invoice_date;
}).set(function (val) {
  this.invoice_date = val;
});

saleorderSchema.index({ customer_id: 1 });
saleorderSchema.index({ fin_year: 1 });
saleorderSchema.index({ invoice_date: -1 });
saleorderSchema.index({ challan_date: -1 });

module.exports = mongoose.models.Saleorder || mongoose.model('Saleorder', saleorderSchema);
