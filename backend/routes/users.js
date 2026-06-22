const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper: check user has real DB id
const requireUserId = (req, res) => {
  if (!req.user?._id) {
    res.status(403).json({ success: false, message: 'Admin account cannot use this feature' });
    return false;
  }
  return true;
};

// ── ADDRESSES ──────────────────────────────────────
router.get('/addresses', protect, async (req, res) => {
  try {
    if (!requireUserId(req, res)) return;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/users/addresses/:id  — update an address
router.put('/addresses/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    Object.assign(addr, req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/users/addresses/:id/default
router.put('/addresses/:id/default', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach(a => { a.isDefault = a._id.toString() === req.params.id; });
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/addresses/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PAYMENT METHODS ────────────────────────────────
router.get('/payment-methods', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, paymentMethods: user.paymentMethods });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/payment-methods', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.paymentMethods.forEach(p => p.isDefault = false);
    user.paymentMethods.push(req.body);
    await user.save();
    res.json({ success: true, paymentMethods: user.paymentMethods });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/payment-methods/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.paymentMethods = user.paymentMethods.filter(p => p._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, paymentMethods: user.paymentMethods });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/payment-methods/:id/default', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.paymentMethods.forEach(p => { p.isDefault = p._id.toString() === req.params.id; });
    await user.save();
    res.json({ success: true, paymentMethods: user.paymentMethods });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── WISHLIST ───────────────────────────────────────
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(req.params.productId)) user.wishlist.push(req.params.productId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/users/wishlist — bulk replace wishlist (for frontend sync)
router.put('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const ids = (req.body.wishlist || []).filter(id => /^[a-f\d]{24}$/i.test(String(id)));
    user.wishlist = ids;
    await user.save();
    res.json({ success: true, message: 'Wishlist synced' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
