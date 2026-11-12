const express = require('express');
const Favorite = require('../models/Favorite');
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id })
            .populate('menuItem')
            .sort({ createdAt: -1 });

        res.json({
            favorites: favorites.map(f => ({
                id: f._id,
                menuItemId: f.menuItem._id,
                menuItem: f.menuItem,
                createdAt: f.createdAt
            }))
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch favorites' }
        });
    }
});

// @route   GET /api/favorites/ids
// @desc    Get just the IDs of user's favorite menu items
// @access  Private
router.get('/ids', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id }).select('menuItem');

        res.json({
            favoriteIds: favorites.map(f => f.menuItem.toString())
        });
    } catch (error) {
        console.error('Get favorite IDs error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch favorite IDs' }
        });
    }
});

// @route   POST /api/favorites/:menuItemId
// @desc    Add to favorites
// @access  Private
router.post('/:menuItemId', auth, async (req, res) => {
    try {
        const { menuItemId } = req.params;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                error: { message: 'Menu item not found' }
            });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            user: req.user._id,
            menuItem: menuItemId
        });

        if (existingFavorite) {
            return res.status(400).json({
                error: { message: 'Item already in favorites' }
            });
        }

        const favorite = new Favorite({
            user: req.user._id,
            menuItem: menuItemId
        });

        await favorite.save();

        res.status(201).json({
            message: 'Added to favorites',
            favorite: {
                id: favorite._id,
                menuItemId: favorite.menuItem,
                createdAt: favorite.createdAt
            }
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            error: { message: 'Failed to add to favorites' }
        });
    }
});

// @route   DELETE /api/favorites/:menuItemId
// @desc    Remove from favorites
// @access  Private
router.delete('/:menuItemId', auth, async (req, res) => {
    try {
        const result = await Favorite.findOneAndDelete({
            user: req.user._id,
            menuItem: req.params.menuItemId
        });

        if (!result) {
            return res.status(404).json({
                error: { message: 'Favorite not found' }
            });
        }

        res.json({
            message: 'Removed from favorites'
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            error: { message: 'Failed to remove from favorites' }
        });
    }
});

// @route   POST /api/favorites/:menuItemId/toggle
// @desc    Toggle favorite status
// @access  Private
router.post('/:menuItemId/toggle', auth, async (req, res) => {
    try {
        const { menuItemId } = req.params;

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            user: req.user._id,
            menuItem: menuItemId
        });

        if (existingFavorite) {
            // Remove favorite
            await existingFavorite.deleteOne();
            return res.json({
                action: 'removed',
                message: 'Removed from favorites'
            });
        } else {
            // Check if menu item exists
            const menuItem = await MenuItem.findById(menuItemId);
            if (!menuItem) {
                return res.status(404).json({
                    error: { message: 'Menu item not found' }
                });
            }

            // Add favorite
            const favorite = new Favorite({
                user: req.user._id,
                menuItem: menuItemId
            });
            await favorite.save();

            return res.json({
                action: 'added',
                message: 'Added to favorites',
                favorite: {
                    id: favorite._id,
                    menuItemId: favorite.menuItem
                }
            });
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            error: { message: 'Failed to toggle favorite' }
        });
    }
});

module.exports = router;
