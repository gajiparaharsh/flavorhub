import { useState, useEffect } from 'react';
import { api } from '@/integrations/mongodb';

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface PopularItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  quantity: number;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  customerCount?: number;
  dailyRevenue: DailyRevenue[];
  monthlyData: MonthlyData[];
  popularItems: PopularItem[];
  statusBreakdown: StatusBreakdown[];
  categoryRevenue: CategoryRevenue[];
  recentOrders: { id: string; orderId?: string; total: number; status: string; date: string }[];
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await api.getAnalytics();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refetch: fetchAnalytics };
}
