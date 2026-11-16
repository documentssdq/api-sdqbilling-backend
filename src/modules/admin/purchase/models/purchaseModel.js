const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    purchase_no: {
      type: String,
      required: [true, 'Purchase number is required'],
      trim: true,
      unique: true,
    },
    purchaseorder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchaseorder',
      default: null,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partys',
      required: [true, 'Vendor is required'],
    },
    invoice_date: {
      type: Date,
      required: [true, 'Invoice date is required'],
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
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

purchaseSchema.index({ purchase_no: 1 }, { unique: true });
purchaseSchema.index({ purchaseorder_id: 1 });
purchaseSchema.index({ vendor_id: 1 });
purchaseSchema.index({ currency_id: 1 });
purchaseSchema.index({ invoice_date: -1 });
purchaseSchema.index({ fin_year: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
