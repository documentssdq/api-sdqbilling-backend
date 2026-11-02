const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    pageName: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    content: { type: String, trim: true, default: '' },
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, default: '' },
    metaKeyword: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    template: { type: String, trim: true, default: '' },
    externalUrl: { type: String, trim: true, default: '' },
    widgets: { type: Array, default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pageSchema.index({ pageName: 1 });

pageSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Page', pageSchema);
