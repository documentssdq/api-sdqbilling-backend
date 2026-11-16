const mongoose = require('mongoose');

const purchaseorderSchema = new mongoose.Schema(
  {
    purchase_order_no: {
      type: String,
      required: [true, 'Purchase order number is required'],
      trim: true,
      unique: true,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partys',
      required: [true, 'Vendor is required'],
    },
    invoice_date: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now,
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
    collection: 'purchaseorder',
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.purchase_order_no && ret.purchase_no) ret.purchase_order_no = ret.purchase_no;
        if (!ret.purchase_no && ret.purchase_order_no) ret.purchase_no = ret.purchase_order_no;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (!ret.purchase_order_no && ret.purchase_no) ret.purchase_order_no = ret.purchase_no;
        if (!ret.purchase_no && ret.purchase_order_no) ret.purchase_no = ret.purchase_order_no;
        return ret;
      },
    },
  }
);

// Virtual alias purchase_no for backward/unified compatibility
purchaseorderSchema.virtual('purchase_no').get(function () {
  return this.purchase_order_no;
}).set(function (val) {
  this.purchase_order_no = val;
});

// Virtual alias order_date for invoice_date
purchaseorderSchema.virtual('order_date').get(function () {
  return this.invoice_date;
}).set(function (val) {
  this.invoice_date = val;
});

purchaseorderSchema.index({ vendor_id: 1 });
purchaseorderSchema.index({ fin_year: 1 });
purchaseorderSchema.index({ invoice_date: -1 });

module.exports = mongoose.model('Purchaseorder', purchaseorderSchema);
