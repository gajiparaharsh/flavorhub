// API Client for MongoDB Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private token: string | null = null;

    constructor() {
        // Load token from localStorage on init
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getToken(): string | null {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers: HeadersInit = {
            ...options.headers,
        };

        // Only set Content-Type to application/json if body is not FormData
        if (!(options.body instanceof FormData)) {
            (headers as Record<string, string>)['Content-Type'] = 'application/json';
        }

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Request failed');
        }

        return data;
    }

    // Upload endpoint
    async uploadImage(file: File) {
        const formData = new FormData();
        formData.append('image', file);

        return this.request<{ url: string; filename: string }>('/upload', {
            method: 'POST',
            body: formData,
        });
    }

    // Auth endpoints
    async register(email: string, password: string, fullName: string, phone: string) {
        const data = await this.request<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName, phone }),
        });
        this.setToken(data.token);
        return data;
    }

    async login(email: string, password: string) {
        const data = await this.request<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.setToken(null);
        }
    }

    async getMe() {
        return this.request<{ user: any }>('/auth/me');
    }

    async changePassword(currentPassword: string, newPassword: string) {
        return this.request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    async deleteAccount(password: string) {
        const result = await this.request<{ message: string }>('/auth/delete-account', {
            method: 'DELETE',
            body: JSON.stringify({ password }),
        });
        this.setToken(null);
        return result;
    }

    async getLoginHistory() {
        return this.request<{ loginHistory: any[]; totalEntries: number }>('/auth/login-history');
    }

    async getSecurityInfo() {
        return this.request<{ security: any }>('/auth/security-info');
    }

    // Menu endpoints
    async getMenuItems(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<{ items: any[]; count: number }>(`/menu${query}`);
    }

    async getCategories() {
        return this.request<{ categories: string[] }>('/menu/categories');
    }

    async getMenuItem(id: string) {
        return this.request<{ item: any }>(`/menu/${id}`);
    }

    async createMenuItem(item: any) {
        return this.request<{ item: any }>('/menu', {
            method: 'POST',
            body: JSON.stringify(item),
        });
    }

    async updateMenuItem(id: string, updates: any) {
        return this.request<{ item: any }>(`/menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async toggleMenuItemAvailability(id: string, isAvailable: boolean) {
        return this.request<{ item: any }>(`/menu/${id}/availability`, {
            method: 'PATCH',
            body: JSON.stringify({ isAvailable }),
        });
    }

    async deleteMenuItem(id: string) {
        return this.request(`/menu/${id}`, { method: 'DELETE' });
    }

    // Order endpoints
    async getOrders(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<{ orders: any[]; pagination: any }>(`/orders${query}`);
    }

    async getActiveOrders() {
        return this.request<{ orders: any[] }>('/orders/active');
    }

    async getOrder(id: string) {
        return this.request<{ order: any }>(`/orders/${id}`);
    }

    async getFranchises(city?: string) {
        const query = city ? `?city=${encodeURIComponent(city)}` : '';
        return this.request<any[]>(`/franchises${query}`);
    }

    async createOrder(orderData: {
        items: { menuItemId: string; quantity: number }[];
        deliveryAddress: string;
        notes?: string;
        paymentMethod?: 'cod' | 'online' | 'upi';
        franchiseId?: string;
    }) {
        return this.request<{ order: any }>('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async cancelOrder(id: string) {
        return this.request<{ order: any }>(`/orders/${id}/cancel`, {
            method: 'PATCH',
        });
    }

    // User profile endpoints
    async getProfile() {
        return this.request<{ profile: any }>('/users/profile');
    }

    async updateProfile(updates: { fullName?: string; phone?: string; address?: string }) {
        return this.request<{ profile: any }>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async getUserOrders() {
        return this.request<{ orders: any[] }>('/users/orders');
    }

    async getUserStats() {
        return this.request<{ stats: any }>('/users/stats');
    }

    // Favorites endpoints
    async getFavorites() {
        return this.request<{ favorites: any[] }>('/favorites');
    }

    async getFavoriteIds() {
        return this.request<{ favoriteIds: string[] }>('/favorites/ids');
    }

    async addFavorite(menuItemId: string) {
        return this.request<{ favorite: any }>(`/favorites/${menuItemId}`, {
            method: 'POST',
        });
    }

    async removeFavorite(menuItemId: string) {
        return this.request(`/favorites/${menuItemId}`, {
            method: 'DELETE',
        });
    }

    async toggleFavorite(menuItemId: string) {
        return this.request<{ action: 'added' | 'removed' }>(`/favorites/${menuItemId}/toggle`, {
            method: 'POST',
        });
    }

    // Promotions endpoints
    async getPromotions() {
        return this.request<{ promotions: any[] }>('/promotions');
    }

    async getAllPromotions() {
        return this.request<{ promotions: any[] }>('/promotions/all');
    }

    async validatePromoCode(code: string, orderTotal: number) {
        return this.request<{ valid: boolean; promotion: any }>('/promotions/validate', {
            method: 'POST',
            body: JSON.stringify({ code, orderTotal }),
        });
    }

    async createPromotion(promo: any) {
        return this.request<{ promotion: any }>('/promotions', {
            method: 'POST',
            body: JSON.stringify(promo),
        });
    }

    async updatePromotion(id: string, updates: any) {
        return this.request<{ promotion: any }>(`/promotions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deletePromotion(id: string) {
        return this.request(`/promotions/${id}`, { method: 'DELETE' });
    }

    // Reviews endpoints
    async getMenuItemReviews(menuItemId: string) {
        return this.request<{ reviews: any[]; averageRating: number; totalReviews: number }>(
            `/reviews/menu/${menuItemId}`
        );
    }

    async getUserReviews() {
        return this.request<{ reviews: any[] }>('/reviews/user');
    }

    async createReview(menuItemId: string, rating: number, comment?: string) {
        return this.request<{ review: any }>(`/reviews/${menuItemId}`, {
            method: 'POST',
            body: JSON.stringify({ rating, comment }),
        });
    }

    async deleteReview(reviewId: string) {
        return this.request(`/reviews/${reviewId}`, { method: 'DELETE' });
    }

    // Admin endpoints
    async getAdminOrders(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<{ orders: any[]; pagination: any }>(`/admin/orders${query}`);
    }

    async updateOrderStatus(orderId: string, status: string) {
        return this.request<{ order: any }>(`/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getCustomers() {
        return this.request<{ customers: any[] }>('/admin/customers');
    }

    async getCustomer(id: string) {
        return this.request<{ customer: any }>(`/admin/customers/${id}`);
    }

    async createAdminUser(userData: any) {
        return this.request<{ user: any }>('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Analytics endpoints
    async getAnalytics() {
        return this.request<any>('/analytics');
    }

    async getAnalyticsSummary() {
        return this.request<any>('/analytics/summary');
    }

    // Health check
    async healthCheck() {
        return this.request<{ status: string; timestamp: string }>('/health');
    }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
