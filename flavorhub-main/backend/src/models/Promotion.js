const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Promotion name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: [0, 'Discount value cannot be negative']
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum order amount cannot be negative']
    },
    code: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true // Allows multiple null values
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startsAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    imageUrl: {
        type: String,
        trim: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for active promotions lookup
promotionSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });
promotionSchema.index({ code: 1 });

// Method to check if promotion is valid
promotionSchema.methods.isValid = function () {
    const now = new Date();

    if (!this.isActive) return false;
    if (this.startsAt && now < this.startsAt) return false;
    if (this.expiresAt && now > this.expiresAt) return false;
    if (this.usageLimit && this.usageCount >= this.usageLimit) return false;

    return true;
};

// Calculate discount amount
promotionSchema.methods.calculateDiscount = function (orderTotal) {
    if (orderTotal < this.minOrderAmount) return 0;

    if (this.discountType === 'percentage') {
        return (orderTotal * this.discountValue) / 100;
    }
    return Math.min(this.discountValue, orderTotal);
};

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
