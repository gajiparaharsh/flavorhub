const express = require('express');
const { body, query } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const { auth, optionalAuth, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/menu
// @desc    Get all menu items (with optional filters)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            category,
            search,
            isVegetarian,
            isVegan,
            isGlutenFree,
            minPrice,
            maxPrice,
            sortBy = 'category',
            sortOrder = 'asc',
            available = 'true'
        } = req.query;

        // Build query
        const query = {};

        // Only show available items for non-admin users
        if (available === 'true' && (!req.user || req.user.role !== 'admin')) {
            query.isAvailable = true;
        }

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (isVegetarian === 'true') query.isVegetarian = true;
        if (isVegan === 'true') query.isVegan = true;
        if (isGlutenFree === 'true') query.isGlutenFree = true;

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Sort options
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        if (sortBy !== 'name') {
            sort.name = 1; // Secondary sort by name
        }

        const items = await MenuItem.find(query).sort(sort);

        res.json({
            count: items.length,
            items
        });
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch menu items' }
        });
    }
});

// @route   GET /api/menu/categories
// @desc    Get all unique categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await MenuItem.distinct('category', { isAvailable: true });
        res.json({ categories: categories.sort() });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch categories' }
        });
    }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                error: { message: 'Menu item not found' }
            });
        }

        res.json({ item });
    } catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch menu item' }
        });
    }
});

// @route   POST /api/menu
// @desc    Create menu item (Admin only)
// @access  Private/Admin
router.post('/', auth, adminOnly, [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').optional().trim(),
    body('imageUrl').optional().trim(),
    body('isVegetarian').optional().isBoolean(),
    body('isVegan').optional().isBoolean(),
    body('isGlutenFree').optional().isBoolean(),
    body('containsNuts').optional().isBoolean(),
    body('containsDairy').optional().isBoolean(),
    body('spiceLevel').optional().isInt({ min: 0, max: 5 })
], validate, async (req, res) => {
    try {
        const item = new MenuItem(req.body);
        await item.save();

        res.status(201).json({
            message: 'Menu item created successfully',
            item
        });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({
            error: { message: 'Failed to create menu item' }
        });
    }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item (Admin only)
// @access  Private/Admin
router.put('/:id', auth, adminOnly, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty')
], validate, async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({
                error: { message: 'Menu item not found' }
            });
        }

        res.json({
            message: 'Menu item updated successfully',
            item
        });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({
            error: { message: 'Failed to update menu item' }
        });
    }
});

// @route   PATCH /api/menu/:id/availability
// @desc    Toggle menu item availability (Admin only)
// @access  Private/Admin
router.patch('/:id/availability', auth, adminOnly, async (req, res) => {
    try {
        const { isAvailable } = req.body;

        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { isAvailable },
            { new: true }
        );

        if (!item) {
            return res.status(404).json({
                error: { message: 'Menu item not found' }
            });
        }

        res.json({
            message: `Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully`,
            item
        });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({
            error: { message: 'Failed to update availability' }
        });
    }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                error: { message: 'Menu item not found' }
            });
        }

        res.json({
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({
            error: { message: 'Failed to delete menu item' }
        });
    }
});

module.exports = router;
