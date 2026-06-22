const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, gender } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email & password required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
    const user = await User.create({ name, email, password, phone: phone || '', gender: gender || '', isAdmin });
    const token = makeToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email & password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Auto-fix isAdmin flag for admin email
    const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
    if (isAdmin && !user.isAdmin) { user.isAdmin = true; await user.save(); }

    const token = makeToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/google — Firebase Google login
// Works for ALL users including admin. Returns real JWT always.
router.post('/google', async (req, res) => {
  try {
    const { name, email, avatar, googleId } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({ name, email, avatar, googleId, isAdmin });
    } else {
      // Update google info if missing, and ensure isAdmin flag is correct
      let changed = false;
      if (!user.googleId) { user.googleId = googleId; changed = true; }
      if (avatar && !user.avatar) { user.avatar = avatar; changed = true; }
      if (isAdmin && !user.isAdmin) { user.isAdmin = true; changed = true; }
      if (changed) await user.save();
    }

    // Always return a real JWT (not 'admin-token') so backend API works properly
    const token = makeToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    // Virtual admin fallback (no _id in DB)
    if (!req.user._id || req.user._id === 'admin') {
      return res.json({ success: true, user: req.user });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, gender, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, gender: user.gender, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ success: false, message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
