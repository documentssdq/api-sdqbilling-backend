const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema(
  {
    mainTitle: { type: String, required: true, trim: true },
    subTitle: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    externalUrl: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    displaySequence: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

widgetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Widget', widgetSchema);
