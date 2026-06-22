const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');


// ================= USER ROUTES =================

// POST /api/orders — place order
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      shippingCost,
      discount,
      totalAmount
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    if (!totalAmount || isNaN(Number(totalAmount))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount'
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const sanitizedItems = (items || []).map(item => {
      const productId = item.product;
      const isValidObjectId = mongoose.Types.ObjectId.isValid(productId);
      return {
        ...item,
        product: isValidObjectId ? productId : undefined
      };
    });

    const order = await Order.create({
      user: req.user._id,
      items: sanitizedItems,
      shippingAddress,
      paymentMethod,
      itemsTotal: itemsTotal || 0,
      shippingCost: shippingCost || 0,
      discount: discount || 0,
      totalAmount,
    });

    const populated = await Order.findById(order._id)
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      order: populated
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// GET /api/orders/my — logged-in user's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// GET /api/orders/track/:id
router.get('/track/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// PUT /api/orders/:id/cancel — user cancels order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (
      !req.user.isAdmin &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${order.status} order`
      });
    }

    order.status = 'Cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by user';

    await order.save();

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ================= ADMIN ROUTES =================

// GET /api/admin/orders — get all orders (ADMIN)
router.get('/admin/orders', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// PUT /api/admin/orders/:id/status — update order status (ADMIN)
router.put('/admin/orders/:id/status', protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin only'
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


module.exports = router;