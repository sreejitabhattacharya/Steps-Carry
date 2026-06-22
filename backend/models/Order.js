
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     String,
  image:    String,
  price:    Number,
  quantity: Number,
  size:     String,
  color:    String,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name:    String,
    phone:   String,
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    pincode: String,
  },
  paymentMethod: {
    type:    { type: String, default: 'COD' },
    details: String,
  },
  itemsTotal:    { type: Number, default: 0 },
  shippingCost:  { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  totalAmount:   { type: Number, required: true },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed',
  },
  trackingId:   { type: String, default: '' },
  cancelReason: { type: String, default: '' },
  deliveredAt:  Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
