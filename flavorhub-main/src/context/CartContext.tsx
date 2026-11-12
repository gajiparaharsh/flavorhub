import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRestaurantHours } from '@/hooks/useRestaurantHours';

// Define MenuItem and CartItem interfaces here for better decoupling
export interface MenuItem {
  id: string;
  _id?: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  image?: string | null; // Used by FoodCard
  imageUrl?: string | null;
  image_url?: string | null;
  isVegetarian?: boolean;
  is_vegetarian?: boolean;
  isVegan?: boolean;
  is_vegan?: boolean;
  isGlutenFree?: boolean;
  is_gluten_free?: boolean;
  containsNuts?: boolean;
  contains_nuts?: boolean;
  containsDairy?: boolean;
  contains_dairy?: boolean;
  allergenInfo?: string | null;
  allergen_info?: string | null;
  isAvailable?: boolean;
  is_available?: boolean;
  spiceLevel?: number | null;
  spice_level?: number | null;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isRestaurantOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { isOpen: isRestaurantOpen, statusMessage } = useRestaurantHours();

  // Validate ID format - accept both UUID and MongoDB ObjectId
  const isValidId = (id: string) => {
    // UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // MongoDB ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-f]{24}$/i;
    return uuidRegex.test(id) || objectIdRegex.test(id);
  };

  const addToCart = (item: MenuItem) => {
    const itemId = item.id || item._id;

    if (!itemId) {
      console.error('Item has no ID:', item);
      toast({
        title: "Error",
        description: "This item cannot be added. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    // Validate item has a valid ID (from database, not static data)
    if (!isValidId(itemId)) {
      console.error('Invalid item ID format:', itemId);
      toast({
        title: "Error",
        description: "This item cannot be added. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!isRestaurantOpen) {
      toast({
        title: "Restaurant is closed",
        description: `We're currently closed. ${statusMessage}`,
        variant: "destructive",
      });
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(i => (i.id || i._id) === itemId);
      if (existingItem) {
        return prevItems.map(i =>
          (i.id || i._id) === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, id: itemId, quantity: 1 }];
    });
    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(i => (i.id || i._id) !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(i => ((i.id || i._id) === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isRestaurantOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
