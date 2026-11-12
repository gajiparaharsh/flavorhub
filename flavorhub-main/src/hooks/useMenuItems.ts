import { useState, useEffect, useMemo } from 'react';
import { api } from '@/integrations/mongodb';
import { useToast } from '@/hooks/use-toast';

export interface MenuItem {
  id: string;
  _id?: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  image_url?: string | null; // Alias for compatibility
  isVegetarian: boolean;
  is_vegetarian?: boolean;
  isVegan: boolean;
  is_vegan?: boolean;
  isGlutenFree: boolean;
  is_gluten_free?: boolean;
  containsNuts: boolean;
  contains_nuts?: boolean;
  containsDairy: boolean;
  contains_dairy?: boolean;
  allergenInfo: string | null;
  allergen_info?: string | null;
  isAvailable: boolean;
  is_available?: boolean;
  spiceLevel: number | null;
  spice_level?: number | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface MenuItemInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  containsNuts?: boolean;
  containsDairy?: boolean;
  allergenInfo?: string | null;
  isAvailable?: boolean;
  spiceLevel?: number;
}

// Helper to normalize item from API to component format
function normalizeMenuItem(item: any): MenuItem {
  return {
    id: item._id || item.id,
    _id: item._id || item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl || item.image_url,
    image_url: item.imageUrl || item.image_url,
    isVegetarian: item.isVegetarian ?? item.is_vegetarian ?? false,
    is_vegetarian: item.isVegetarian ?? item.is_vegetarian ?? false,
    isVegan: item.isVegan ?? item.is_vegan ?? false,
    is_vegan: item.isVegan ?? item.is_vegan ?? false,
    isGlutenFree: item.isGlutenFree ?? item.is_gluten_free ?? false,
    is_gluten_free: item.isGlutenFree ?? item.is_gluten_free ?? false,
    containsNuts: item.containsNuts ?? item.contains_nuts ?? false,
    contains_nuts: item.containsNuts ?? item.contains_nuts ?? false,
    containsDairy: item.containsDairy ?? item.contains_dairy ?? false,
    contains_dairy: item.containsDairy ?? item.contains_dairy ?? false,
    allergenInfo: item.allergenInfo ?? item.allergen_info ?? null,
    allergen_info: item.allergenInfo ?? item.allergen_info ?? null,
    isAvailable: item.isAvailable ?? item.is_available ?? true,
    is_available: item.isAvailable ?? item.is_available ?? true,
    spiceLevel: item.spiceLevel ?? item.spice_level ?? 0,
    spice_level: item.spiceLevel ?? item.spice_level ?? 0,
    createdAt: item.createdAt || item.created_at || '',
    created_at: item.createdAt || item.created_at || '',
    updatedAt: item.updatedAt || item.updated_at || '',
    updated_at: item.updatedAt || item.updated_at || '',
  };
}

export function useMenuItems(adminMode = false) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (adminMode) {
        params.available = 'all'; // Show all items in admin mode
      }

      const { items: data } = await api.getMenuItems(params);
      setItems((data || []).map(normalizeMenuItem));
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: MenuItemInput) => {
    try {
      const { item: data } = await api.createMenuItem(item);
      const normalizedItem = normalizeMenuItem(data);
      setItems(prev => [...prev, normalizedItem]);
      toast({
        title: 'Success',
        description: 'Menu item added successfully',
      });
      return { data: normalizedItem, error: null };
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add menu item',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateItem = async (id: string, updates: Partial<MenuItemInput>) => {
    try {
      const { item: data } = await api.updateMenuItem(id, updates);
      const normalizedItem = normalizeMenuItem(data);
      setItems(prev => prev.map(item => item.id === id ? normalizedItem : item));
      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });
      return { data: normalizedItem, error: null };
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update menu item',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.deleteMenuItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete menu item',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const { item: data } = await api.toggleMenuItemAvailability(id, isAvailable);
      const normalizedItem = normalizeMenuItem(data);
      setItems(prev => prev.map(item => item.id === id ? normalizedItem : item));
      toast({
        title: 'Success',
        description: `Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      });
      return { data: normalizedItem, error: null };
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update availability',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Memoize categories to prevent infinite re-render loops
  const categories = useMemo(() => {
    return [...new Set(items.map(item => item.category))];
  }, [items]);

  return {
    items,
    loading,
    categories,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    refetch: fetchItems,
  };
}
