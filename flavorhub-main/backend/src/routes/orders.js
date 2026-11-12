const express = require('express');
const { body } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;

        const query = { user: req.user._id };
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('items.menuItem', 'name imageUrl');

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch orders' }
        });
    }
});

// @route   GET /api/orders/active
// @desc    Get user's active orders (for tracking)
// @access  Private
router.get('/active', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
            status: { $nin: ['delivered', 'cancelled'] }
        }).sort({ createdAt: -1 });

        res.json({ orders });
    } catch (error) {
        console.error('Get active orders error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch active orders' }
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.menuItem', 'name imageUrl category');

        if (!order) {
            return res.status(404).json({
                error: { message: 'Order not found' }
            });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch order' }
        });
    }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
    body('franchiseId').optional().trim(),
    body('paymentMethod').optional().isIn(['cod', 'online', 'upi']).withMessage('Invalid payment method'),
    body('notes').optional().trim()
], validate, async (req, res) => {
    try {
        const { items, deliveryAddress, notes, paymentMethod = 'cod', franchiseId } = req.body;

        // Verify all menu items and calculate total
        const menuItemIds = items.map(item => item.menuItemId);
        const menuItems = await MenuItem.find({
            _id: { $in: menuItemIds },
            isAvailable: true
        });

        if (menuItems.length !== items.length) {
            return res.status(400).json({
                error: { message: 'One or more menu items are not available' }
            });
        }

        // Build order items with verified prices
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const menuItem = menuItems.find(m => m._id.toString() === item.menuItemId);

            if (!menuItem) {
                return res.status(400).json({
                    error: { message: `Menu item ${item.menuItemId} not found` }
                });
            }

            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                menuItem: menuItem._id,
                menuItemName: menuItem.name,
                quantity: item.quantity,
                price: menuItem.price
            });
        }

        // Create order
        const order = new Order({
            user: req.user._id,
            franchise: franchiseId || null,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            notes,
            paymentMethod,
            status: 'pending',
            statusHistory: [{ status: 'pending', timestamp: new Date() }]
        });

        await order.save();

        // Emit real-time event for new order (admin dashboard)
        const io = req.app.get('io');
        if (io) {
            io.to('admin-room').emit('new-order', {
                orderId: order._id,
                orderNumber: order.orderId,
                totalAmount: order.totalAmount,
                timestamp: order.createdAt
            });
        }

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            error: { message: 'Failed to create order' }
        });
    }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order (only pending orders)
// @access  Private
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                error: { message: 'Order not found' }
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                error: { message: 'Only pending orders can be cancelled' }
            });
        }

        order.status = 'cancelled';
        await order.save();

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${req.user._id}`).emit('order-update', {
                orderId: order._id,
                status: order.status
            });
            io.to('admin-room').emit('order-update', {
                orderId: order._id,
                status: order.status
            });
        }

        res.json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            error: { message: 'Failed to cancel order' }
        });
    }
});

// @route   PATCH /api/orders/:id/location
// @desc    Update delivery driver location
// @access  Public (for simulation or driver app)
router.patch('/:id/location', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: { message: 'Order not found' } });
        }

        order.deliveryLocation = { lat, lng, lastUpdated: new Date() };
        await order.save();

        const io = req.app.get('io');
        if (io) {
            // Emit directly to the order's specific room if we had one, or to the user
            io.to(`user-${order.user}`).emit('order-location-update', {
                orderId: order._id,
                location: order.deliveryLocation
            });
        }

        res.json({ success: true, location: order.deliveryLocation });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ error: { message: 'Failed to update location' } });
    }
});

module.exports = router;
