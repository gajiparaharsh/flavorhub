const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics
// @desc    Get dashboard analytics (Admin)
// @access  Private/Admin
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get all orders (excluding cancelled)
        const allOrders = await Order.find({ status: { $ne: 'cancelled' } });

        // Today's stats
        const todayOrders = allOrders.filter(o => o.createdAt >= today);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        // This week's stats
        const weekOrders = allOrders.filter(o => o.createdAt >= weekAgo);
        const weekRevenue = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        // Total stats
        const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = allOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Daily revenue (last 7 days)
        const dailyRevenue = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

            const dayOrders = allOrders.filter(
                o => o.createdAt >= date && o.createdAt < nextDate
            );

            dailyRevenue.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
                orders: dayOrders.length
            });
        }

        // Monthly data (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthOrders = allOrders.filter(
                o => o.createdAt >= monthStart && o.createdAt <= monthEnd
            );

            monthlyData.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                revenue: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0),
                orders: monthOrders.length
            });
        }

        // Popular items
        const itemMap = new Map();
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const key = item.menuItemName;
                const existing = itemMap.get(key) || { quantity: 0, revenue: 0 };
                itemMap.set(key, {
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + (item.price * item.quantity)
                });
            });
        });

        const popularItems = Array.from(itemMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Category revenue
        const menuItems = await MenuItem.find();
        const menuItemMap = new Map(menuItems.map(m => [m._id.toString(), m.category]));

        const categoryMap = new Map();
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const category = menuItemMap.get(item.menuItem?.toString()) || 'Other';
                const existing = categoryMap.get(category) || { revenue: 0, quantity: 0 };
                categoryMap.set(category, {
                    revenue: existing.revenue + (item.price * item.quantity),
                    quantity: existing.quantity + item.quantity
                });
            });
        });

        const categoryRevenue = Array.from(categoryMap.entries())
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.revenue - a.revenue);

        // Status breakdown
        const allOrdersWithCancelled = await Order.find();
        const statusBreakdown = {};
        allOrdersWithCancelled.forEach(order => {
            statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
        });

        // Recent orders
        const recentOrders = allOrdersWithCancelled
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10)
            .map(o => ({
                id: o._id,
                orderId: o.orderId,
                total: o.totalAmount,
                status: o.status,
                date: o.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }));

        // Customer count
        const customerCount = await User.countDocuments({ role: 'user' });

        res.json({
            totalRevenue,
            totalOrders,
            averageOrderValue: Math.round(averageOrderValue * 100) / 100,
            todayRevenue,
            todayOrders: todayOrders.length,
            weekRevenue,
            weekOrders: weekOrders.length,
            customerCount,
            dailyRevenue,
            monthlyData,
            popularItems,
            categoryRevenue,
            statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
            recentOrders
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch analytics' }
        });
    }
});

// @route   GET /api/analytics/summary
// @desc    Get quick summary (Admin)
// @access  Private/Admin
router.get('/summary', auth, adminOnly, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalOrders,
            todayOrders,
            pendingOrders,
            totalCustomers
        ] = await Promise.all([
            Order.countDocuments({ status: { $ne: 'cancelled' } }),
            Order.countDocuments({ createdAt: { $gte: today }, status: { $ne: 'cancelled' } }),
            Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
            User.countDocuments({ role: 'user' })
        ]);

        res.json({
            totalOrders,
            todayOrders,
            pendingOrders,
            totalCustomers
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch summary' }
        });
    }
});

module.exports = router;
