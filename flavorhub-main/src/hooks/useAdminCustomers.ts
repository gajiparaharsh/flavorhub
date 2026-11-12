import { useState, useEffect } from 'react';
import { api } from '@/integrations/mongodb';
import { useToast } from '@/hooks/use-toast';

export interface CustomerOrder {
  id: string;
  status: string;
  totalAmount: number;
  total_amount?: number;
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

export interface Customer {
  id: string;
  email: string;
  fullName: string | null;
  full_name?: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  created_at?: string;
  orders: CustomerOrder[];
  totalSpent: number;
  total_spent?: number;
  orderCount: number;
  order_count?: number;
}

// Normalize customer from API
function normalizeCustomer(customer: any): Customer {
  const orders = (customer.orders || []).map((order: any) => ({
    id: order._id || order.id,
    status: order.status,
    totalAmount: order.totalAmount || order.total_amount,
    total_amount: order.totalAmount || order.total_amount,
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
  }));

  return {
    id: customer._id || customer.id,
    email: customer.email,
    fullName: customer.fullName || customer.full_name,
    full_name: customer.fullName || customer.full_name,
    phone: customer.phone,
    address: customer.address,
    createdAt: customer.createdAt || customer.created_at,
    created_at: customer.createdAt || customer.created_at,
    orders,
    totalSpent: customer.totalSpent || customer.total_spent || 0,
    total_spent: customer.totalSpent || customer.total_spent || 0,
    orderCount: customer.orderCount || customer.order_count || orders.length,
    order_count: customer.orderCount || customer.order_count || orders.length,
  };
}

export function useAdminCustomers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { customers: data } = await api.getCustomers();
      setCustomers((data || []).map(normalizeCustomer));
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load customers.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    refetch: fetchCustomers,
  };
}
