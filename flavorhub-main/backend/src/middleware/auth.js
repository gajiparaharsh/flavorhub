const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: { message: 'No authentication token, access denied' }
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                error: { message: 'User not found' }
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                error: { message: 'Account is deactivated' }
            });
        }

        // Attach user to request
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: { message: 'Invalid token' }
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: { message: 'Token expired' }
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({
            error: { message: 'Server error during authentication' }
        });
    }
};

// Optional auth - doesn't fail if no token, but attaches user if valid token exists
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user && user.isActive) {
            req.user = user;
            req.token = token;
        }
        next();
    } catch (error) {
        // Silently continue without user
        next();
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: { message: 'Authentication required' }
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: { message: 'Admin access required' }
        });
    }

    next();
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

module.exports = {
    auth,
    optionalAuth,
    adminOnly,
    generateToken
};
