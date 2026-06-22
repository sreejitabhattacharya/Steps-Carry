require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('Admin@1234', 10);
  const result = await User.findOneAndUpdate(
    { email: process.env.ADMIN_EMAIL.toLowerCase() },
    { password: hash, isAdmin: true },
    { new: true, upsert: true }
  );
  if (result) {
    console.log('✅ Admin password reset to Admin@1234');
    console.log('✅ Email:', result.email);
    console.log('✅ isAdmin:', result.isAdmin);
  }
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
