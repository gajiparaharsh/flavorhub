export { api, default as apiClient } from './client';
export { socketClient } from './socket';

// Types for the API responses
export interface User {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    address: string | null;
    role: 'user' | 'admin';
    createdAt: string;
}

export interface MenuItem {
    _id: string;
    id?: string; // Alias for _id
    name: string;
    description: string | null;
    price: number;
    category: string;
    imageUrl: string | null;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    containsNuts: boolean;
    containsDairy: boolean;
    allergenInfo: string | null;
    isAvailable: boolean;
    spiceLevel: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    _id?: string;
    menuItem: string;
    menuItemName: string;
    quantity: number;
    price: number;
}

export interface Order {
    _id: string;
    id?: string;
    orderId: string;
    user: string | User;
    items: OrderItem[];
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    totalAmount: number;
    deliveryAddress: string | null;
    notes: string | null;
    paymentMethod: 'cod' | 'online' | 'upi';
    paymentId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Favorite {
    _id: string;
    id?: string;
    menuItemId: string;
    menuItem?: MenuItem;
    createdAt: string;
}

export interface Promotion {
    _id: string;
    id?: string;
    name: string;
    description: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    code: string | null;
    isActive: boolean;
    startsAt: string;
    expiresAt: string | null;
    imageUrl: string | null;
}

export interface Review {
    _id: string;
    id?: string;
    user: string | { fullName: string };
    menuItem: string;
    rating: number;
    comment: string | null;
    createdAt: string;
}

// Helper to normalize MongoDB _id to id
export function normalizeId<T extends { _id?: string; id?: string }>(obj: T): T & { id: string } {
    return {
        ...obj,
        id: obj._id || obj.id || '',
    };
}

export function normalizeIds<T extends { _id?: string; id?: string }>(arr: T[]): (T & { id: string })[] {
    return arr.map(normalizeId);
}
