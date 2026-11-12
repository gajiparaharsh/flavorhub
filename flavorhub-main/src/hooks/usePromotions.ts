import { useState, useEffect } from 'react';
import { api } from '@/integrations/mongodb';

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discount_type?: 'percentage' | 'fixed';
  discountValue: number;
  discount_value?: number;
  minOrderAmount: number;
  min_order_amount?: number;
  code: string | null;
  isActive: boolean;
  is_active?: boolean;
  startsAt: string;
  starts_at?: string;
  expiresAt: string | null;
  expires_at?: string | null;
  imageUrl: string | null;
  image_url?: string | null;
}

// Normalize promotion from API
function normalizePromotion(promo: any): Promotion {
  return {
    id: promo._id || promo.id,
    name: promo.name,
    description: promo.description,
    discountType: promo.discountType || promo.discount_type,
    discount_type: promo.discountType || promo.discount_type,
    discountValue: promo.discountValue || promo.discount_value,
    discount_value: promo.discountValue || promo.discount_value,
    minOrderAmount: promo.minOrderAmount || promo.min_order_amount || 0,
    min_order_amount: promo.minOrderAmount || promo.min_order_amount || 0,
    code: promo.code,
    isActive: promo.isActive ?? promo.is_active ?? true,
    is_active: promo.isActive ?? promo.is_active ?? true,
    startsAt: promo.startsAt || promo.starts_at,
    starts_at: promo.startsAt || promo.starts_at,
    expiresAt: promo.expiresAt || promo.expires_at,
    expires_at: promo.expiresAt || promo.expires_at,
    imageUrl: promo.imageUrl || promo.image_url,
    image_url: promo.imageUrl || promo.image_url,
  };
}

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      const { promotions: data } = await api.getPromotions();
      setPromotions((data || []).map(normalizePromotion));
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return { promotions, loading, refetch: fetchPromotions };
};
