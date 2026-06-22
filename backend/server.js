require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/products',    require('./routes/products'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/contacts',    require('./routes/contacts'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/reviews',     require('./routes/reviews'));
app.use('/api/qa',          require('./routes/qa'));
app.use('/api/my-activity', require('./routes/activity'));
// app.use('/api', require('./routes/orders'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Steps & Carry Backend OK', time: new Date() });
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Auto-fix admin user — create if not exists, update isAdmin flag
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (adminEmail) {
      const existing = await User.findOne({ email: adminEmail });
      if (existing) {
        // Just ensure isAdmin is true
        if (!existing.isAdmin) {
          existing.isAdmin = true;
          await existing.save();
        }
        console.log('✅ Admin user verified: ' + adminEmail);
      } else {
        // Auto-create admin user so Google login works immediately
        const hash = await bcrypt.hash('Admin@SC2024', 10);
        await User.create({
          name: 'Admin',
          email: adminEmail,
          password: hash,
          isAdmin: true,
        });
        console.log('✅ Admin user auto-created: ' + adminEmail + ' password=Admin@SC2024');
      }
    }
  } catch (e) {
    console.log('⚠️ Admin setup error:', e.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Admin email: ${process.env.ADMIN_EMAIL}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  });
};

start();
