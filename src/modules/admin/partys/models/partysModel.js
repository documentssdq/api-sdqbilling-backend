const mongoose = require('mongoose');

const partysSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    partyType: {
      type: String,
      enum: ['customer', 'vendor', 'both'],
      required: [true, 'Party type is required'],
      default: 'customer',
    },
    phone: {
      type: String,
      required: [true, 'Phone / Mobile number is required'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    taxType: {
      type: String,
      enum: ['GST', 'VAT'],
      default: 'GST',
    },
    currency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Currency',
      default: null,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    gstin: { type: String, trim: true, default: '' },
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Countries',
      default: null,
    },
    state_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      default: null,
    },
    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
    },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    openingBalance: { type: Number, default: 0 },
    openingBalanceType: {
      type: String,
      enum: ['debit', 'credit'],
      default: 'debit',
    },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
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

partysSchema.index({ name: 1 }, { unique: true });
partysSchema.index({ partyType: 1 });
partysSchema.index({ phone: 1 }, { unique: true });
partysSchema.index({ email: 1 }, { unique: true });
partysSchema.index({ gstin: 1 });
partysSchema.index({ currency_id: 1 });
partysSchema.index({ country_id: 1 });
partysSchema.index({ state_id: 1 });
partysSchema.index({ city_id: 1 });

module.exports = mongoose.model('Partys', partysSchema);
