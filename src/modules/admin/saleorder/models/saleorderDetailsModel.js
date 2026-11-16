const mongoose = require('mongoose');

const saleorderDetailsSchema = new mongoose.Schema(
  {
    saleorder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Saleorder',
      required: [true, 'Sale order ID is required'],
      index: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Services',
      required: [true, 'Service is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: 0,
    },
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Unit is required'],
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'saleorder_details',
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

saleorderDetailsSchema.index({ saleorder_id: 1 });
saleorderDetailsSchema.index({ service_id: 1 });
saleorderDetailsSchema.index({ unit_id: 1 });

module.exports = mongoose.models.SaleorderDetails || mongoose.model('SaleorderDetails', saleorderDetailsSchema);

