const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                // Allow connection without auth for public updates
                socket.user = null;
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user || !user.isActive) {
                socket.user = null;
                return next();
            }

            socket.user = user;
            next();
        } catch (error) {
            // Allow connection but without user context
            socket.user = null;
            next();
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Join user-specific room if authenticated
        if (socket.user) {
            const userRoom = `user-${socket.user._id}`;
            socket.join(userRoom);
            console.log(`👤 User ${socket.user.email} joined room: ${userRoom}`);

            // Join admin room if user is admin
            if (socket.user.role === 'admin') {
                socket.join('admin-room');
                console.log(`👑 Admin ${socket.user.email} joined admin-room`);
            }
        }

        // Handle joining order tracking room
        socket.on('track-order', (orderId) => {
            if (socket.user) {
                socket.join(`order-${orderId}`);
                console.log(`📦 User tracking order: ${orderId}`);
            }
        });

        // Handle leaving order tracking room
        socket.on('untrack-order', (orderId) => {
            socket.leave(`order-${orderId}`);
        });

        // Handle admin subscription to all orders
        socket.on('subscribe-admin-orders', () => {
            if (socket.user && socket.user.role === 'admin') {
                socket.join('admin-room');
                socket.emit('subscribed', { room: 'admin-room' });
                console.log(`👑 Admin subscribed to order updates`);
            }
        });

        // Handle disconnect
        socket.on('disconnect', (reason) => {
            console.log(`🔌 Socket disconnected: ${socket.id} - Reason: ${reason}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });

        // Ping/pong for connection health
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
    });

    // Utility function to emit order updates
    io.emitOrderUpdate = (userId, orderData) => {
        io.to(`user-${userId}`).emit('order-update', orderData);
        io.to('admin-room').emit('order-update', orderData);
    };

    // Utility function to emit new order notification
    io.emitNewOrder = (orderData) => {
        io.to('admin-room').emit('new-order', orderData);
    };

    console.log('✅ Socket.io handler initialized');
};

module.exports = socketHandler;
