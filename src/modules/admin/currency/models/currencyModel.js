const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true, default: '' },
    symbol: { type: String, trim: true, default: '' },
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

currencySchema.index({ name: 1 });
currencySchema.index({ code: 1 });

module.exports = mongoose.model('Currency', currencySchema);
