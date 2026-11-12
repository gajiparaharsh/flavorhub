const express = require('express');
const { body } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply auth and adminOnly to all routes
router.use(auth, adminOnly);

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/orders', async (req, res) => {
    try {
        const { status, limit = 100, page = 1 } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(query)
            .populate('user', 'fullName phone email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        // Format orders with profile info
        const formattedOrders = orders.map(order => ({
            id: order._id,
            orderId: order.orderId,
            user: order.user,
            status: order.status,
            totalAmount: order.totalAmount,
            deliveryAddress: order.deliveryAddress,
            notes: order.notes,
            paymentMethod: order.paymentMethod,
            items: order.items,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            profile: order.user ? {
                fullName: order.user.fullName,
                phone: order.user.phone
            } : null
        }));

        res.json({
            orders: formattedOrders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch orders' }
        });
    }
});

// @route   PATCH /api/admin/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private/Admin
router.patch('/orders/:id/status', [
    body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
        .withMessage('Invalid status')
], validate, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'fullName email');

        if (!order) {
            return res.status(404).json({
                error: { message: 'Order not found' }
            });
        }

        const previousStatus = order.status;
        order.status = status;
        await order.save();

        // Emit real-time update to user and admin
        const io = req.app.get('io');
        if (io) {
            // Notify the user
            io.to(`user-${order.user._id}`).emit('order-update', {
                orderId: order._id,
                orderNumber: order.orderId,
                status: order.status,
                previousStatus,
                message: getStatusMessage(status)
            });

            // Notify all admins
            io.to('admin-room').emit('order-status-changed', {
                orderId: order._id,
                orderNumber: order.orderId,
                status: order.status,
                previousStatus
            });
        }

        res.json({
            message: 'Order status updated successfully',
            order: {
                id: order._id,
                orderId: order.orderId,
                status: order.status,
                previousStatus
            }
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            error: { message: 'Failed to update order status' }
        });
    }
});

// @route   GET /api/admin/customers
// @desc    Get all customers (Admin)
// @access  Private/Admin
router.get('/customers', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .sort({ createdAt: -1 });

        // Get order stats for each user
        const customerData = await Promise.all(
            users.map(async (user) => {
                const orders = await Order.find({
                    user: user._id,
                    status: { $ne: 'cancelled' }
                });

                return {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    address: user.address,
                    createdAt: user.createdAt,
                    orderCount: orders.length,
                    totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                    lastOrder: orders[0]?.createdAt || null
                };
            })
        );

        res.json({
            customers: customerData,
            count: customerData.length
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch customers' }
        });
    }
});

// @route   GET /api/admin/customers/:id
// @desc    Get customer details with orders (Admin)
// @access  Private/Admin
router.get('/customers/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: { message: 'Customer not found' }
            });
        }

        const orders = await Order.find({ user: user._id })
            .sort({ createdAt: -1 });

        res.json({
            customer: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                createdAt: user.createdAt,
                orders,
                stats: {
                    totalOrders: orders.length,
                    completedOrders: orders.filter(o => o.status === 'delivered').length,
                    totalSpent: orders
                        .filter(o => o.status !== 'cancelled')
                        .reduce((sum, o) => sum + o.totalAmount, 0)
                }
            }
        });
    } catch (error) {
        console.error('Get customer details error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch customer details' }
        });
    }
});

// @route   POST /api/admin/users
// @desc    Create admin user (Admin)
// @access  Private/Admin
router.post('/users', [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('role').isIn(['user', 'admin']).withMessage('Invalid role')
], validate, async (req, res) => {
    try {
        const { email, password, fullName, phone, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: { message: 'User with this email already exists' }
            });
        }

        const user = new User({
            email,
            password,
            fullName,
            phone,
            role
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            error: { message: 'Failed to create user' }
        });
    }
});

// Helper function for status messages
function getStatusMessage(status) {
    const messages = {
        pending: 'Your order is being reviewed',
        confirmed: 'Your order has been confirmed!',
        preparing: 'The chef is preparing your food',
        ready: 'Your order is ready for delivery',
        delivered: 'Your order has been delivered!',
        cancelled: 'Your order was cancelled'
    };
    return messages[status] || 'Order status updated';
}

module.exports = router;
