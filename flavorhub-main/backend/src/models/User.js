const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const loginHistorySchema = new mongoose.Schema({
    ipAddress: { type: String, default: 'Unknown' },
    userAgent: { type: String, default: 'Unknown' },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    device: { type: String, default: 'Desktop' },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    timestamp: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    fullName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    // Security fields
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    passwordChangedAt: {
        type: Date,
        default: null
    },
    loginHistory: {
        type: [loginHistorySchema],
        default: [],
        select: false // Don't include in queries by default (privacy + performance)
    }
}, {
    timestamps: true
});

// Virtual to check if account is currently locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        // Track password change date
        this.passwordChangedAt = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Increment failed login attempts and lock if necessary
userSchema.methods.incrementFailedAttempts = async function () {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

    // If lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil < new Date()) {
        this.failedLoginAttempts = 1;
        this.lockUntil = null;
        return this.save();
    }

    this.failedLoginAttempts += 1;

    // Lock account if max attempts reached
    if (this.failedLoginAttempts >= MAX_ATTEMPTS) {
        this.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    return this.save();
};

// Reset failed login attempts on successful login
userSchema.methods.resetFailedAttempts = async function () {
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    return this.save();
};

// Add login history entry
userSchema.methods.addLoginHistory = async function (entry) {
    // Load login history (since it's select: false)
    const user = await mongoose.model('User').findById(this._id).select('+loginHistory');

    user.loginHistory.push({
        ipAddress: entry.ipAddress || 'Unknown',
        userAgent: entry.userAgent || 'Unknown',
        browser: entry.browser || 'Unknown',
        os: entry.os || 'Unknown',
        device: entry.device || 'Desktop',
        status: entry.status || 'success',
        timestamp: new Date()
    });

    // Keep only the last 20 login entries
    if (user.loginHistory.length > 20) {
        user.loginHistory = user.loginHistory.slice(-20);
    }

    return user.save();
};

// Transform output (remove password from JSON)
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email }).select('+password');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
