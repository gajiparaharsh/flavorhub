const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { auth, generateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// ============================================================
//  Rate Limiting - Brute force protection
// ============================================================

// Limit login attempts: 10 requests per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        error: {
            message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
            retryAfter: 15
        }
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

// Limit registration: 5 requests per hour per IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        error: {
            message: 'Too many accounts created from this IP. Please try again after an hour.',
            retryAfter: 60
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================================
//  Helper: Parse User-Agent for browser/OS/device info
// ============================================================
function parseUserAgent(ua) {
    if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };

    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Detect browser
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Opera/') || ua.includes('OPR/')) browser = 'Opera';
    else browser = 'Other';

    // Detect OS
    if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
    else if (ua.includes('Windows NT')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else os = 'Other';

    // Detect device type
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
        device = 'Mobile';
    } else if (ua.includes('iPad') || ua.includes('Tablet')) {
        device = 'Tablet';
    } else {
        device = 'Desktop';
    }

    return { browser, os, device };
}

// ============================================================
//  @route   POST /api/auth/register
//  @desc    Register a new user
//  @access  Public
// ============================================================
router.post('/register', registerLimiter, [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().trim()
], validate, async (req, res) => {
    try {
        const { email, password, fullName, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: { message: 'User with this email already exists' }
            });
        }

        // Create user
        const user = new User({
            email,
            password,
            fullName,
            phone,
            role: 'user'
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Send welcome email (non-blocking)
        sendWelcomeEmail({ email, fullName }).catch(err => {
            console.error('Failed to send welcome email:', err.message);
        });

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: { message: 'Registration failed' }
        });
    }
});

// ============================================================
//  @route   POST /api/auth/login
//  @desc    Login user (with lockout + login history)
//  @access  Public
// ============================================================
router.post('/login', loginLimiter, [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], validate, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get client info for login history
        const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown';
        const userAgentStr = req.headers['user-agent'] || 'Unknown';
        const { browser, os, device } = parseUserAgent(userAgentStr);

        // Find user with password
        const user = await User.findByEmailWithPassword(email);

        if (!user) {
            return res.status(401).json({
                error: { message: 'Invalid email or password' }
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                error: { message: 'Account is deactivated' }
            });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingMs = user.lockUntil - new Date();
            const remainingMinutes = Math.ceil(remainingMs / 60000);

            // Log the failed attempt
            await user.addLoginHistory({
                ipAddress, userAgent: userAgentStr, browser, os, device,
                status: 'failed'
            });

            return res.status(423).json({
                error: {
                    message: `Account is locked due to too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
                    locked: true,
                    lockUntil: user.lockUntil,
                    remainingMinutes
                }
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // Track failed login attempt
            await user.incrementFailedAttempts();

            // Log failed attempt in history
            await user.addLoginHistory({
                ipAddress, userAgent: userAgentStr, browser, os, device,
                status: 'failed'
            });

            const attemptsLeft = 5 - (user.failedLoginAttempts + 1);

            // Check if account just got locked
            if (attemptsLeft <= 0) {
                return res.status(423).json({
                    error: {
                        message: 'Account locked due to 5 failed login attempts. Try again after 15 minutes.',
                        locked: true,
                        lockUntil: user.lockUntil
                    }
                });
            }

            return res.status(401).json({
                error: {
                    message: `Invalid email or password. ${attemptsLeft} attempt(s) remaining before account lock.`,
                    attemptsLeft
                }
            });
        }

        // Successful login — reset failed attempts
        await user.resetFailedAttempts();

        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        // Log successful login in history
        await user.addLoginHistory({
            ipAddress, userAgent: userAgentStr, browser, os, device,
            status: 'success'
        });

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                passwordChangedAt: user.passwordChangedAt
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: { message: 'Login failed' }
        });
    }
});

// ============================================================
//  @route   GET /api/auth/me
//  @desc    Get current user info
//  @access  Private
// ============================================================
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                fullName: req.user.fullName,
                phone: req.user.phone,
                address: req.user.address,
                role: req.user.role,
                createdAt: req.user.createdAt,
                lastLogin: req.user.lastLogin,
                passwordChangedAt: req.user.passwordChangedAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: { message: 'Failed to get user data' }
        });
    }
});

// ============================================================
//  @route   GET /api/auth/login-history
//  @desc    Get user's login history
//  @access  Private
// ============================================================
router.get('/login-history', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+loginHistory');

        if (!user) {
            return res.status(404).json({
                error: { message: 'User not found' }
            });
        }

        // Return login history sorted by most recent first
        const history = (user.loginHistory || [])
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20); // Max 20 entries

        res.json({
            loginHistory: history,
            totalEntries: history.length
        });
    } catch (error) {
        console.error('Login history error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch login history' }
        });
    }
});

// ============================================================
//  @route   GET /api/auth/security-info
//  @desc    Get user's security information
//  @access  Private
// ============================================================
router.get('/security-info', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: { message: 'User not found' }
            });
        }

        res.json({
            security: {
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                passwordChangedAt: user.passwordChangedAt,
                failedLoginAttempts: user.failedLoginAttempts,
                isLocked: !!(user.lockUntil && user.lockUntil > new Date()),
                lockUntil: user.lockUntil,
                accountAge: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) // days
            }
        });
    } catch (error) {
        console.error('Security info error:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch security information' }
        });
    }
});

// ============================================================
//  @route   POST /api/auth/logout
//  @desc    Logout user
//  @access  Private
// ============================================================
router.post('/logout', auth, async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: { message: 'Logout failed' }
        });
    }
});

// ============================================================
//  @route   POST /api/auth/refresh
//  @desc    Refresh JWT token
//  @access  Private
// ============================================================
router.post('/refresh', auth, async (req, res) => {
    try {
        const newToken = generateToken(req.user._id);
        res.json({
            token: newToken,
            user: {
                id: req.user._id,
                email: req.user.email,
                fullName: req.user.fullName,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            error: { message: 'Token refresh failed' }
        });
    }
});

// ============================================================
//  @route   PUT /api/auth/change-password
//  @desc    Change password
//  @access  Private
// ============================================================
router.put('/change-password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                error: { message: 'Current password is incorrect' }
            });
        }

        // Update password (passwordChangedAt is set automatically in pre-save hook)
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Password changed successfully',
            passwordChangedAt: user.passwordChangedAt
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: { message: 'Failed to change password' }
        });
    }
});

// ============================================================
//  @route   DELETE /api/auth/delete-account
//  @desc    Delete user account (requires password confirmation)
//  @access  Private
// ============================================================
router.delete('/delete-account', auth, [
    body('password').notEmpty().withMessage('Password is required for account deletion')
], validate, async (req, res) => {
    try {
        const { password } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                error: { message: 'User not found' }
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                error: { message: 'Incorrect password' }
            });
        }

        // Delete all associated data
        const Order = require('../models/Order');
        const Favorite = require('../models/Favorite');
        const Review = require('../models/Review');

        await Promise.all([
            Order.deleteMany({ user: user._id }),
            Favorite.deleteMany({ user: user._id }),
            Review.deleteMany({ user: user._id }),
        ]);

        // Delete the user
        await User.findByIdAndDelete(user._id);

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            error: { message: 'Failed to delete account' }
        });
    }
});

module.exports = router;
