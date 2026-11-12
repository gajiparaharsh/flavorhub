import { useState, useEffect } from 'react';
import { api } from '@/integrations/mongodb';
import { socketClient } from '@/integrations/mongodb/socket';
import { useToast } from '@/hooks/use-toast';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menu_item_id?: string;
  menuItemName: string;
  menu_item_name?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user_id?: string;
  status: OrderStatus;
  totalAmount: number;
  total_amount?: number;
  deliveryAddress: string | null;
  delivery_address?: string | null;
  notes: string | null;
  paymentMethod: 'cod' | 'online';
  payment_method?: 'cod' | 'online';
  razorpayPaymentId: string | null;
  razorpay_payment_id?: string | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  items: OrderItem[];
  order_items?: OrderItem[];
  profile?: {
    fullName: string | null;
    full_name?: string | null;
    phone: string | null;
  };
}

// Play notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create a pleasant chime sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1); // C#6 note
    oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.2); // E6 note

    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

// Normalize order from API
function normalizeOrder(order: any): Order {
  const items = (order.items || order.order_items || []).map((item: any) => ({
    id: item._id || item.id,
    menuItemId: item.menuItem || item.menuItemId || item.menu_item_id,
    menu_item_id: item.menuItem || item.menuItemId || item.menu_item_id,
    menuItemName: item.menuItemName || item.menu_item_name,
    menu_item_name: item.menuItemName || item.menu_item_name,
    quantity: item.quantity,
    price: item.price,
  }));

  return {
    id: order._id || order.id,
    userId: order.user?._id || order.user?.id || order.user || order.userId || order.user_id,
    user_id: order.user?._id || order.user?.id || order.user || order.userId || order.user_id,
    status: order.status,
    totalAmount: order.totalAmount || order.total_amount,
    total_amount: order.totalAmount || order.total_amount,
    deliveryAddress: order.deliveryAddress || order.delivery_address,
    delivery_address: order.deliveryAddress || order.delivery_address,
    notes: order.notes,
    paymentMethod: order.paymentMethod || order.payment_method || 'cod',
    payment_method: order.paymentMethod || order.payment_method || 'cod',
    razorpayPaymentId: order.paymentId || order.razorpayPaymentId || order.razorpay_payment_id,
    razorpay_payment_id: order.paymentId || order.razorpayPaymentId || order.razorpay_payment_id,
    createdAt: order.createdAt || order.created_at,
    created_at: order.createdAt || order.created_at,
    updatedAt: order.updatedAt || order.updated_at,
    updated_at: order.updatedAt || order.updated_at,
    items,
    order_items: items,
    profile: order.profile || (order.user ? {
      fullName: order.user.fullName || order.user.full_name,
      full_name: order.user.fullName || order.user.full_name,
      phone: order.user.phone,
    } : undefined),
  };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { orders: ordersData } = await api.getAdminOrders();
      setOrders((ordersData || []).map(normalizeOrder));
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);

      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
        )
      );

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time order updates via Socket.io
    socketClient.subscribeAdminOrders();

    const unsubscribeNew = socketClient.onNewOrder(() => {
      playNotificationSound();
      fetchOrders();
      toast({
        title: '🔔 New Order!',
        description: 'A new order has been placed',
      });
    });

    const unsubscribeUpdate = socketClient.onOrderUpdate(() => {
      fetchOrders();
    });

    const unsubscribeStatusChanged = socketClient.onOrderStatusChanged(() => {
      fetchOrders();
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeStatusChanged();
    };
  }, []);

  return {
    orders,
    loading,
    updateOrderStatus,
    refetchOrders: fetchOrders,
  };
}
