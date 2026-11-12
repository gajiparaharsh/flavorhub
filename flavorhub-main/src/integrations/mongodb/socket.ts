import { io, Socket } from 'socket.io-client';
import api from './client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketClient {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    connect() {
        if (this.socket?.connected) return;

        const token = api.getToken();

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('🔌 Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Re-emit events to registered listeners
        this.socket.onAny((event, ...args) => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.forEach(callback => callback(...args));
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    reconnect() {
        this.disconnect();
        this.connect();
    }

    // Subscribe to events
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    // Emit events
    emit(event: string, data?: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        }
    }

    // Track order for real-time updates
    trackOrder(orderId: string) {
        this.emit('track-order', orderId);
    }

    // Stop tracking order
    untrackOrder(orderId: string) {
        this.emit('untrack-order', orderId);
    }

    // Subscribe to admin order updates
    subscribeAdminOrders() {
        this.emit('subscribe-admin-orders');
    }

    // Order update listener helper
    onOrderUpdate(callback: (data: any) => void) {
        return this.on('order-update', callback);
    }

    onOrderLocationUpdate(callback: (data: any) => void) {
        return this.on('order-location-update', callback);
    }

    // New order listener (admin)
    onNewOrder(callback: (data: any) => void) {
        return this.on('new-order', callback);
    }

    // Order status changed listener (admin)
    onOrderStatusChanged(callback: (data: any) => void) {
        return this.on('order-status-changed', callback);
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;
