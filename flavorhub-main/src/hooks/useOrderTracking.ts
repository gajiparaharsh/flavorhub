import { useState, useEffect, useCallback } from 'react';
import { api } from '@/integrations/mongodb';
import { socketClient } from '@/integrations/mongodb/socket';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface TrackedOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  total_amount?: number;
  deliveryAddress: string | null;
  delivery_address?: string | null;
  notes: string | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  items: {
    id: string;
    menuItemName: string;
    menu_item_name?: string;
    quantity: number;
    price: number;
  }[];
  deliveryLocation?: {
    lat: number;
    lng: number;
  };
}

const getStatusEmoji = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return '⏳';
    case 'confirmed': return '✅';
    case 'preparing': return '👨‍🍳';
    case 'ready': return '🍽️';
    case 'delivered': return '🎉';
    case 'cancelled': return '❌';
    default: return '📦';
  }
};

const getStatusMessage = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return 'Your order is being reviewed';
    case 'confirmed': return 'Your order has been confirmed!';
    case 'preparing': return 'The chef is preparing your food';
    case 'ready': return 'Your order is ready for delivery';
    case 'delivered': return 'Your order has been delivered!';
    case 'cancelled': return 'Your order was cancelled';
    default: return 'Order status updated';
  }
};

// Play notification sound for status updates
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

// Normalize order from API
function normalizeOrder(order: any): TrackedOrder {
  return {
    id: order._id || order.id,
    status: order.status,
    totalAmount: order.totalAmount || order.total_amount,
    total_amount: order.totalAmount || order.total_amount,
    deliveryAddress: order.deliveryAddress || order.delivery_address,
    delivery_address: order.deliveryAddress || order.delivery_address,
    notes: order.notes,
    createdAt: order.createdAt || order.created_at,
    created_at: order.createdAt || order.created_at,
    updatedAt: order.updatedAt || order.updated_at,
    updated_at: order.updatedAt || order.updated_at,
    items: (order.items || order.order_items || []).map((item: any) => ({
      id: item._id || item.id,
      menuItemName: item.menuItemName || item.menu_item_name,
      menu_item_name: item.menuItemName || item.menu_item_name,
      quantity: item.quantity,
      price: item.price,
    })),
    deliveryLocation: order.deliveryLocation,
  };
}

export const useOrderTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { orders: data } = await api.getOrders();
      setOrders((data || []).map(normalizeOrder));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time order updates via Socket.io
  useEffect(() => {
    if (!user) return;

    // Subscribe to order updates
    const unsubscribe = socketClient.onOrderUpdate((payload: any) => {
      console.log('Order updated:', payload);
      const newStatus = payload.status as OrderStatus;
      const orderId = payload.orderId;

      const oldOrder = orders.find(o => o.id === orderId);

      // Show notification if status changed
      if (oldOrder && oldOrder.status !== newStatus) {
        playNotificationSound();
        toast({
          title: `${getStatusEmoji(newStatus)} Order Update`,
          description: getStatusMessage(newStatus),
          duration: 5000,
        });
      }

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
    });

    const unsubscribeLocation = socketClient.onOrderLocationUpdate((payload: any) => {
      console.log('Location updated:', payload);
      setOrders(prev => prev.map(order => 
        order.id === payload.orderId ? { ...order, deliveryLocation: payload.location } : order
      ));
    });

    return () => {
      unsubscribe();
      unsubscribeLocation();
    };
  }, [user, orders, toast]);

  const activeOrders = orders.filter(o =>
    !['delivered', 'cancelled'].includes(o.status)
  );

  const pastOrders = orders.filter(o =>
    ['delivered', 'cancelled'].includes(o.status)
  );

  return { orders, activeOrders, pastOrders, loading, refetch: fetchOrders };
};
