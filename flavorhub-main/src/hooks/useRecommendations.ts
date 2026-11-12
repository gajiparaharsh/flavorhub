import { useState, useEffect, useCallback } from 'react';
import { api } from '@/integrations/mongodb';
import { useAuth } from '@/context/AuthContext';

interface RecommendedItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, get popular items as recommendations
      // In the future, this could be a dedicated recommendations endpoint
      const { items } = await api.getMenuItems({ limit: '5' });

      setRecommendations(items.map((item: any) => ({
        id: item._id || item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
      })));
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user, fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
  };
}
