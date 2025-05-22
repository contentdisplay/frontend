// services/admin/promoCodeService.ts
import api from '../api';

export interface PromoCode {
  id: number;
  code: string;
  bonus_amount: string;
  usage_limit: number;
  used_count: number;
  expiry_date: string;
  is_active: boolean;
  created_by_username: string;
  created_at: string;
  usage_percentage: number;
  is_expired: boolean;
}

export interface CreatePromoCodeData {
  code: string;
  bonus_amount: number;
  usage_limit: number;
  expiry_date: string;
  is_active: boolean;
}

export interface PromoCodeUsage {
  id: number;
  username: string;
  user_email: string;
  promo_code: string;
  used_at: string;
  bonus_received: string;
}

export interface PromoCodeUsageResponse {
  promo_code: string;
  total_usages: number;
  usages: Array<{
    user_id: number;
    username: string;
    email: string;
    used_at: string;
    bonus_received: string;
  }>;
}

const promoCodeService = {
  // Get all promo codes
  getPromoCodes: async (): Promise<PromoCode[]> => {
    try {
      const response = await api.get('/auth/admin/promo-codes/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching promo codes:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch promo codes');
    }
  },

  // Get single promo code
  getPromoCode: async (id: number): Promise<PromoCode> => {
    try {
      const response = await api.get(`/auth/admin/promo-codes/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching promo code:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch promo code');
    }
  },

  // Create new promo code
  createPromoCode: async (data: CreatePromoCodeData): Promise<PromoCode> => {
    try {
      const response = await api.post('/auth/admin/promo-codes/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      const errorMessage = error.response?.data?.detail || 
        (error.response?.data ? Object.values(error.response.data).flat().join(", ") : 
        'Failed to create promo code');
      throw new Error(errorMessage);
    }
  },

  // Update promo code
  updatePromoCode: async (id: number, data: Partial<CreatePromoCodeData>): Promise<PromoCode> => {
    try {
      const response = await api.put(`/auth/admin/promo-codes/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating promo code:', error);
      const errorMessage = error.response?.data?.detail || 
        (error.response?.data ? Object.values(error.response.data).flat().join(", ") : 
        'Failed to update promo code');
      throw new Error(errorMessage);
    }
  },

  // Delete promo code
  deletePromoCode: async (id: number): Promise<void> => {
    try {
      await api.delete(`/auth/admin/promo-codes/${id}/`);
    } catch (error: any) {
      console.error('Error deleting promo code:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete promo code');
    }
  },

  // Get promo code usage statistics
  getPromoCodeUsage: async (id: number): Promise<PromoCodeUsageResponse> => {
    try {
      const response = await api.get(`/auth/admin/promo-codes/${id}/usage/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching promo code usage:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch promo code usage');
    }
  },

  // Validate promo code (public endpoint)
  validatePromoCode: async (code: string): Promise<{
    valid: boolean;
    message: string;
    bonus_amount?: string;
  }> => {
    try {
      const response = await api.post('/auth/promo-code/validate/', { code });
      return response.data;
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate promo code');
    }
  },
};

export default promoCodeService;