const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            profile: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch profile' }
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
    body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().trim(),
    body('address').optional().trim()
], validate, async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;

        const updates = {};
        if (fullName !== undefined) updates.fullName = fullName;
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) updates.address = address;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true }
        );

        res.json({
            message: 'Profile updated successfully',
            profile: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: { message: 'Failed to update profile' }
        });
    }
});

// @route   GET /api/users/orders
// @desc    Get user's order history with details
// @access  Private
router.get('/orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            orders,
            count: orders.length
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch orders' }
        });
    }
});

// @route   GET /api/users/stats
// @desc    Get user's statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
            status: { $ne: 'cancelled' }
        });

        const stats = {
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
            pendingOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
            deliveredOrders: orders.filter(o => o.status === 'delivered').length
        };

        res.json({ stats });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch statistics' }
        });
    }
});

module.exports = router;
