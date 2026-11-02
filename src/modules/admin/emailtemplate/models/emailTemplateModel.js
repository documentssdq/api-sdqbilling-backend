const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'] },
  unique_code: { type: String, required: [true, 'Unique Code is required'], unique: true },
  subject: { type: String, required: [true, 'Subject is required'] },
  from_email: { type: String, default: "" },
  from_name: { type: String, default: "" },
  message: { type: String, required: [true, 'Message is required'] },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a virtual 'id' field that maps to '_id'
emailTemplateSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
module.exports = EmailTemplate;
