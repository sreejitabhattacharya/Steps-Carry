const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  // Legacy 'admin-token' support — look up real admin from DB
  // (This path is kept for backward compat but real JWT is always preferred)
  if (token === 'admin-token') {
    try {
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      const adminUser = await User.findOne({ email: adminEmail }).select('-password');
      if (adminUser) {
        req.user = adminUser;
        req.user.isAdmin = true;
        return next();
      }
    } catch {}
    // If admin not in DB, reject — don't allow null _id ghost access
    return res.status(401).json({ success: false, message: 'Admin not set up. Please restart the backend server.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.email === process.env.ADMIN_EMAIL?.toLowerCase()) {
      user.isAdmin = true;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired. Please login again.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ success: false, message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
