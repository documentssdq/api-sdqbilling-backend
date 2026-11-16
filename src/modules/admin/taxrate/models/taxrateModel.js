const mongoose = require('mongoose');

const taxrateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rate: {
      type: Number,
      required: [true, 'Tax rate percentage is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
      default: 0,
    },
    taxType: {
      type: String,
      enum: ['GST', 'VAT'],
      default: 'GST',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    description: { type: String, trim: true, default: '' },
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

taxrateSchema.index({ name: 1 }, { unique: true });
taxrateSchema.index({ taxType: 1 });
taxrateSchema.index({ rate: 1 });
taxrateSchema.index({ isActive: 1 });

module.exports = mongoose.model('Taxrate', taxrateSchema);
