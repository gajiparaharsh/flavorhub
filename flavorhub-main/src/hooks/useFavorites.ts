import { useState, useEffect, useCallback } from 'react';
import { api } from '@/integrations/mongodb';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  menuItemId: string;
  createdAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { favorites: data } = await api.getFavorites();
      setFavorites(data.map((f: any) => ({
        id: f.id || f._id,
        menuItemId: f.menuItemId || f.menuItem?._id || f.menuItem,
        createdAt: f.createdAt,
      })));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((menuItemId: string) => {
    return favorites.some(f => f.menuItemId === menuItemId);
  }, [favorites]);

  const addFavorite = useCallback(async (menuItemId: string, itemName?: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { favorite } = await api.addFavorite(menuItemId);
      setFavorites(prev => [...prev, {
        id: favorite.id || favorite._id,
        menuItemId: favorite.menuItemId || menuItemId,
        createdAt: favorite.createdAt,
      }]);
      toast({
        title: 'Added to favorites',
        description: itemName ? `${itemName} saved to your favorites` : 'Item saved to favorites',
      });
      return true;
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to favorites',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  const removeFavorite = useCallback(async (menuItemId: string, itemName?: string) => {
    if (!user) return false;

    try {
      await api.removeFavorite(menuItemId);
      setFavorites(prev => prev.filter(f => f.menuItemId !== menuItemId));
      toast({
        title: 'Removed from favorites',
        description: itemName ? `${itemName} removed from favorites` : 'Item removed from favorites',
      });
      return true;
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from favorites',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  const toggleFavorite = useCallback(async (menuItemId: string, itemName?: string) => {
    if (isFavorite(menuItemId)) {
      return removeFavorite(menuItemId, itemName);
    } else {
      return addFavorite(menuItemId, itemName);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
