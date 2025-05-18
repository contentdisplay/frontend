import api from '../api';

// Updated adminPromotionService.ts

interface PromotionRequest {
  id: number;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
  status: string;
  requested_at: string;
  reviewed_at: string | null;
}

interface UserProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  age: number;
  gender: string;
  role: string;
  avatar: string | null;
}

interface UserWallet {
  id: number;
  user_id: number;
  balance: number;
  reward_points?: number;
  last_transaction_date: string | null;
}

const adminPromotionService = {
  getPendingPromotions: async (): Promise<PromotionRequest[]> => {
    try {
      const response = await api.get('/auth/promotions/pending/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch pending promotions:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch pending promotions');
    }
  },

  approvePromotion: async (promotionId: number): Promise<any> => {
    try {
      const response = await api.post(`/auth/promotions/approve/${promotionId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to approve promotion:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to approve promotion request');
    }
  },

  rejectPromotion: async (promotionId: number, reason: string): Promise<any> => {
    try {
      const response = await api.post(`/auth/promotions/reject/${promotionId}/`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Failed to reject promotion:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to reject promotion request');
    }
  },

  getUserProfile: async (userId: number): Promise<UserProfile> => {
    try {
      const response = await api.get(`/auth/admin/users/${userId}/profile/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  },

  getUserWallet: async (userId: number): Promise<UserWallet> => {
    try {
      const response = await api.get(`/auth/admin/users/${userId}/wallet/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user wallet:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user wallet information');
    }
  },

  updateUserRole: async (userId: number, role: string): Promise<any> => {
    try {
      const response = await api.post(`/auth/admin/users/${userId}/role/`, { role });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user role:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to update user role');
    }
  },

  // Get all available roles (groups)
  getAvailableRoles: async (): Promise<string[]> => {
    try {
      const response = await api.get('/auth/admin/roles/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch roles:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch available roles');
    }
  }
};

export default adminPromotionService;