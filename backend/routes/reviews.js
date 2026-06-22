const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// GET /api/reviews/:productId — get all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productRef: String(req.params.productId) })
      .sort({ createdAt: -1 });
    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    res.json({ success: true, reviews, avgRating: Number(avgRating) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/reviews/:productId — submit a review (auth required)
router.post('/:productId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment?.trim())
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });

    // Upsert — one review per user per product
    const review = await Review.findOneAndUpdate(
      { productRef: String(req.params.productId), user: req.user._id },
      {
        rating:     Number(rating),
        comment:    comment.trim(),
        reviewImage: req.body.reviewImage || '',
        userName:   req.user.name || 'Anonymous',
        userAvatar: req.user.avatar || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/reviews/:id — delete own review or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
