const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const QA = require('../models/QA');
const { protect } = require('../middleware/auth');

// GET /api/my-activity — get current user's reviews + questions
router.get('/', protect, async (req, res) => {
  try {
    const [reviews, questions] = await Promise.all([
      Review.find({ user: req.user._id }).sort({ createdAt: -1 }),
      QA.find({ user: req.user._id }).sort({ createdAt: -1 }),
    ]);

    const reviewsMapped = reviews.map(r => ({
      _id:         r._id,
      productId:   r.productRef,
      rating:      r.rating,
      comment:     r.comment,
      createdAt:   r.createdAt,
    }));

    const questionsMapped = questions.map(q => ({
      _id:       q._id,
      productId: q.productRef,
      question:  q.question,
      answers:   q.answers,
      createdAt: q.createdAt,
    }));

    res.json({ success: true, reviews: reviewsMapped, questions: questionsMapped });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
