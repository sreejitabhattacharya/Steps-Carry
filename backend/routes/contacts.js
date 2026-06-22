const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contacts  — submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const contact = await Contact.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, message: 'Message sent!', contact });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
