import { useState, useEffect } from 'react';
import { api } from '@/integrations/mongodb';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserOrder {
  id: string;
  status: string;
  totalAmount: number;
  total_amount?: number;
  deliveryAddress: string | null;
  delivery_address?: string | null;
  notes: string | null;
  createdAt: string;
  created_at?: string;
  items: {
    id: string;
    menuItemName: string;
    menu_item_name?: string;
    quantity: number;
    price: number;
  }[];
  order_items?: any[];
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  full_name?: string | null;
  phone: string | null;
  address: string | null;
}

// Normalize order from API
function normalizeOrder(order: any): UserOrder {
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
    items: (order.items || order.order_items || []).map((item: any) => ({
      id: item._id || item.id,
      menuItemName: item.menuItemName || item.menu_item_name,
      menu_item_name: item.menuItemName || item.menu_item_name,
      quantity: item.quantity,
      price: item.price,
    })),
    order_items: order.items || order.order_items,
  };
}

export function useUserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { profile: data } = await api.getProfile();
      setProfile({
        id: data.id || data._id,
        fullName: data.fullName || data.full_name,
        full_name: data.fullName || data.full_name,
        phone: data.phone,
        address: data.address,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { orders: data } = await api.getUserOrders();
      setOrders((data || []).map(normalizeOrder));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const apiUpdates: any = {};
      if (updates.fullName !== undefined || updates.full_name !== undefined) {
        apiUpdates.fullName = updates.fullName || updates.full_name;
      }
      if (updates.phone !== undefined) apiUpdates.phone = updates.phone;
      if (updates.address !== undefined) apiUpdates.address = updates.address;

      await api.updateProfile(apiUpdates);

      setProfile(prev => prev ? {
        ...prev,
        ...updates,
        fullName: updates.fullName || updates.full_name || prev.fullName,
        full_name: updates.fullName || updates.full_name || prev.full_name,
      } : null);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchOrders()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    profile,
    orders,
    loading,
    updateProfile,
    refetchOrders: fetchOrders,
  };
}
