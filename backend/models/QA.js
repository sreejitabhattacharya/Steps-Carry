const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:   { type: String, required: true },
  userAvatar: { type: String, default: '' },
  answer:     { type: String, required: true },
  isAdmin:    { type: Boolean, default: false },
}, { timestamps: true });

const qaSchema = new mongoose.Schema({
  // productRef stores product id as String — works for both local ids ("1","2") and MongoDB ObjectIds
  productRef: { type: String, required: true, index: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:   { type: String, required: true },
  question:   { type: String, required: true },
  answers:    [answerSchema],
}, { timestamps: true });

module.exports = mongoose.model('QA', qaSchema);
