const express = require('express');
const router = express.Router();
const QA = require('../models/QA');
const { protect } = require('../middleware/auth');

// GET /api/qa/:productId
router.get('/:productId', async (req, res) => {
  try {
    const qas = await QA.find({ productRef: String(req.params.productId) }).sort({ createdAt: -1 });
    res.json({ success: true, qas });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/qa/:productId — ask question
router.post('/:productId', protect, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim())
      return res.status(400).json({ success: false, message: 'Question is required' });

    const qa = await QA.create({
      productRef: String(req.params.productId),
      user:       req.user._id,
      userName:   req.user.name,
      question:   question.trim(),
      answers:    [],
    });
    res.status(201).json({ success: true, qa });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/qa/:qaId/answer — answer a question
router.post('/:qaId/answer', protect, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim())
      return res.status(400).json({ success: false, message: 'Answer is required' });

    const qa = await QA.findById(req.params.qaId);
    if (!qa) return res.status(404).json({ success: false, message: 'Question not found' });

    qa.answers.push({
      user:       req.user._id,
      userName:   req.user.name,
      userAvatar: req.user.avatar || '',
      answer:     answer.trim(),
      isAdmin:    req.user.isAdmin || false,
    });
    await qa.save();
    res.json({ success: true, qa });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/qa/:id — delete own question or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const qa = await QA.findById(req.params.id);
    if (!qa) return res.status(404).json({ success: false, message: 'Question not found' });
    if (qa.user.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await QA.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
