const mongoose = require('mongoose');

const purchaseDetailsSchema = new mongoose.Schema(
  {
    purchase_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
      required: [true, 'Purchase ID is required'],
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
    collection: 'purchase_details',
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

purchaseDetailsSchema.index({ purchase_id: 1 });
purchaseDetailsSchema.index({ service_id: 1 });
purchaseDetailsSchema.index({ unit_id: 1 });

module.exports = mongoose.model('PurchaseDetails', purchaseDetailsSchema);

