const express = require('express');
const { body } = require('express-validator');
const Promotion = require('../models/Promotion');
const { auth, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// @route   GET /api/promotions
// @desc    Get active promotions
// @access  Public
router.get('/', async (req, res) => {
    try {
        const now = new Date();

        const promotions = await Promotion.find({
            isActive: true,
            $or: [
                { startsAt: { $lte: now } },
                { startsAt: null }
            ],
            $or: [
                { expiresAt: { $gte: now } },
                { expiresAt: null }
            ]
        }).sort({ expiresAt: 1 });

        res.json({ promotions });
    } catch (error) {
        console.error('Get promotions error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch promotions' }
        });
    }
});

// @route   GET /api/promotions/all
// @desc    Get all promotions (Admin)
// @access  Private/Admin
router.get('/all', auth, adminOnly, async (req, res) => {
    try {
        const promotions = await Promotion.find().sort({ createdAt: -1 });
        res.json({ promotions });
    } catch (error) {
        console.error('Get all promotions error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch promotions' }
        });
    }
});

// @route   POST /api/promotions/validate
// @desc    Validate a promo code
// @access  Private
router.post('/validate', auth, [
    body('code').trim().notEmpty().withMessage('Promo code is required'),
    body('orderTotal').isFloat({ min: 0 }).withMessage('Order total is required')
], validate, async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        const promotion = await Promotion.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!promotion) {
            return res.status(404).json({
                error: { message: 'Promo code not found' }
            });
        }

        if (!promotion.isValid()) {
            return res.status(400).json({
                error: { message: 'This promo code is no longer valid' }
            });
        }

        if (orderTotal < promotion.minOrderAmount) {
            return res.status(400).json({
                error: {
                    message: `Minimum order amount of ₹${promotion.minOrderAmount} required for this code`
                }
            });
        }

        const discount = promotion.calculateDiscount(orderTotal);

        res.json({
            valid: true,
            promotion: {
                id: promotion._id,
                name: promotion.name,
                discountType: promotion.discountType,
                discountValue: promotion.discountValue,
                discount,
                newTotal: orderTotal - discount
            }
        });
    } catch (error) {
        console.error('Validate promo error:', error);
        res.status(500).json({
            error: { message: 'Failed to validate promo code' }
        });
    }
});

// @route   POST /api/promotions
// @desc    Create promotion (Admin)
// @access  Private/Admin
router.post('/', auth, adminOnly, [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
    body('code').optional().trim().toUpperCase(),
    body('minOrderAmount').optional().isFloat({ min: 0 }),
    body('expiresAt').optional().isISO8601()
], validate, async (req, res) => {
    try {
        const promotion = new Promotion(req.body);
        await promotion.save();

        res.status(201).json({
            message: 'Promotion created successfully',
            promotion
        });
    } catch (error) {
        console.error('Create promotion error:', error);
        res.status(500).json({
            error: { message: 'Failed to create promotion' }
        });
    }
});

// @route   PUT /api/promotions/:id
// @desc    Update promotion (Admin)
// @access  Private/Admin
router.put('/:id', auth, adminOnly, validate, async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!promotion) {
            return res.status(404).json({
                error: { message: 'Promotion not found' }
            });
        }

        res.json({
            message: 'Promotion updated successfully',
            promotion
        });
    } catch (error) {
        console.error('Update promotion error:', error);
        res.status(500).json({
            error: { message: 'Failed to update promotion' }
        });
    }
});

// @route   DELETE /api/promotions/:id
// @desc    Delete promotion (Admin)
// @access  Private/Admin
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);

        if (!promotion) {
            return res.status(404).json({
                error: { message: 'Promotion not found' }
            });
        }

        res.json({
            message: 'Promotion deleted successfully'
        });
    } catch (error) {
        console.error('Delete promotion error:', error);
        res.status(500).json({
            error: { message: 'Failed to delete promotion' }
        });
    }
});

module.exports = router;
