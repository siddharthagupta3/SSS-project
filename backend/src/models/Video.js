const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    tags: { type: [String], default: [] },
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, default: '', trim: true },
    duration: { type: Number, default: 0, min: 0 },
    relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Video', videoSchema);
