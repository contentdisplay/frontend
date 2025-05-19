import api from '../api';

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
  id: string;
  balance: number;
  reward_points?: number;
  total_earning?: number;
  total_spending?: number;
  status?: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  groups: string[];
  is_staff: boolean;
  is_superuser: boolean;
}

interface GroupUpdateResponse {
  detail: string;
  balance_deducted: number;
  new_balance: number | null;
  user: {
    id: number;
    username: string;
    groups: string[];
  };
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
      return {
        ...response.data,
        balance: typeof response.data.balance === 'string' ? parseFloat(response.data.balance) : response.data.balance,
        reward_points: typeof response.data.reward_points === 'string' ? parseFloat(response.data.reward_points) : response.data.reward_points,
        total_earning: typeof response.data.total_earning === 'string' ? parseFloat(response.data.total_earning) : response.data.total_earning,
        total_spending: typeof response.data.total_spending === 'string' ? parseFloat(response.data.total_spending) : response.data.total_spending,
      };
    } catch (error: any) {
      console.error('Failed to fetch user wallet:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user wallet information');
    }
  },
  
  getUserData: async (userId: number): Promise<UserData> => {
    try {
      const response = await api.get(`/auth/admin/users/${userId}/data/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user data:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user data');
    }
},

updateUserGroup: async (userId: number, group: string, deductBalance: boolean = true): Promise<GroupUpdateResponse> => {
  try {
    const response = await api.post(`/auth/admin/users/${userId}/group/`, { 
      group,
      deduct_balance: deductBalance 
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update user group:', error.response?.data);
    throw new Error(error.response?.data?.detail || 'Failed to update user group');
  }
},

  // Get all available groups
  getAvailableGroups: async (): Promise<string[]> => {
    try {
      const response = await api.get('/auth/admin/groups/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch groups:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch available groups');
    }
},
  
  // Get admin dashboard stats
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await api.get('/auth/admin/dashboard/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch admin dashboard stats:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch admin dashboard statistics');
    }
  },
  
  // Perform bulk actions on users
  performBulkAction: async (action: string, userIds: number[]): Promise<any> => {
    try {
      const response = await api.post('/auth/admin/users/bulk-actions/', {
        action,
        user_ids: userIds
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to perform bulk action:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to perform bulk action on users');
    }
  }
};

export default adminPromotionService;