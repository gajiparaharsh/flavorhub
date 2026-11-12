const express = require('express');
const { body } = require('express-validator');
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const { auth, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/reviews/menu/:menuItemId
// @desc    Get reviews for a menu item
// @access  Public
router.get('/menu/:menuItemId', async (req, res) => {
    try {
        const reviews = await Review.find({ menuItem: req.params.menuItemId })
            .populate('user', 'fullName')
            .sort({ createdAt: -1 });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.json({
            reviews: reviews.map(r => ({
                id: r._id,
                rating: r.rating,
                comment: r.comment,
                userName: r.user?.fullName || 'Anonymous',
                createdAt: r.createdAt
            })),
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch reviews' }
        });
    }
});

// @route   POST /api/reviews/:menuItemId
// @desc    Create or update a review
// @access  Private
router.post('/:menuItemId', auth, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment too long')
], validate, async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { rating, comment } = req.body;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                error: { message: 'Menu item not found' }
            });
        }

        // Find existing review or create new
        let review = await Review.findOne({
            user: req.user._id,
            menuItem: menuItemId
        });

        if (review) {
            // Update existing review
            review.rating = rating;
            review.comment = comment;
            await review.save();

            return res.json({
                message: 'Review updated successfully',
                review
            });
        }

        // Create new review
        review = new Review({
            user: req.user._id,
            menuItem: menuItemId,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({
            message: 'Review created successfully',
            review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            error: { message: 'Failed to create review' }
        });
    }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private
router.delete('/:reviewId', auth, async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({
            _id: req.params.reviewId,
            user: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                error: { message: 'Review not found or not authorized' }
            });
        }

        res.json({
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            error: { message: 'Failed to delete review' }
        });
    }
});

// @route   GET /api/reviews/user
// @desc    Get current user's reviews
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('menuItem', 'name imageUrl')
            .sort({ createdAt: -1 });

        res.json({ reviews });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch reviews' }
        });
    }
});

module.exports = router;
