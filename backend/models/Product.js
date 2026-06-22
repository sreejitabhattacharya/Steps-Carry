const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  brand:       { type: String, default: '' },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  originalPrice: { type: Number },
  category:    { type: String, default: 'Casual' },
  gender:      { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], default: 'Unisex' },
  sizes:       [String],
  colors:      [String],
  images:      [String],
  stock:       { type: Number, default: 10 },
  sold:        { type: Number, default: 0 },
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
