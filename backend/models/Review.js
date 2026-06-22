const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // productRef stores product id as String — works for both local ids ("1","2") and MongoDB ObjectIds
  productRef:   { type: String, required: true, index: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:     { type: String, required: true },
  userAvatar:   { type: String, default: '' },
  rating:       { type: Number, required: true, min: 1, max: 5 },
  comment:      { type: String, required: true },
  reviewImage:  { type: String, default: '' },
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ productRef: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
