const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  name:     String,
  phone:    String,
  line1:    String,
  line2:    String,
  city:     String,
  state:    String,
  pincode:  String,
  isDefault: { type: Boolean, default: false },
});

const paymentSchema = new mongoose.Schema({
  type:      { type: String, enum: ['Card', 'UPI', 'NetBanking', 'COD'] },
  label:     String,
  details:   String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String },
  phone:      { type: String, default: '' },
  gender:     { type: String, default: '' },
  avatar:     { type: String, default: '' },
  googleId:   { type: String, default: '' },
  isAdmin:    { type: Boolean, default: false },
  addresses:  [addressSchema],
  paymentMethods: [paymentSchema],
  wishlist:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password || '');
};

module.exports = mongoose.model('User', userSchema);
