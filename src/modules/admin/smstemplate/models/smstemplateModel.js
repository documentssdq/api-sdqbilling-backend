const mongoose = require('mongoose');

const smstemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'] },
    unique_code: { type: String, required: [true, 'Unique code is required'], unique: true },
    subject: { type: String },
    template_id: { type: String, required: [true, 'Template ID is required'] },
    message: { type: String, required: [true, 'Message is required'] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

smstemplateSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

smstemplateSchema.index({ unique_code: 1 });

module.exports = mongoose.model('Smstemplate', smstemplateSchema);
