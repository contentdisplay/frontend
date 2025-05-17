import api from '../api';

interface PromotionRequest {
  id: number;
  user: {
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

  requestPromotion: async (): Promise<any> => {
    try {
      const response = await api.post('/auth/promotions/request/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to request promotion:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to submit promotion request');
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

  // Role management functions
  getRoles: async (): Promise<any[]> => {
    try {
      const response = await api.get('/rbac/roles/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch roles:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch roles');
    }
  },

  getRolePermissions: async (roleId: number): Promise<any> => {
    try {
      const response = await api.get(`/rbac/roles/${roleId}/permissions/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch role permissions:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch role permissions');
    }
  },

  updateRolePermissions: async (roleId: number, permissions: any[]): Promise<any> => {
    try {
      const response = await api.put(`/rbac/roles/${roleId}/permissions/`, { permissions });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update role permissions:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to update role permissions');
    }
  },

  createRole: async (roleName: string, permissions: any[]): Promise<any> => {
    try {
      const response = await api.post('/rbac/roles/create/', { 
        name: roleName,
        permissions
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create role:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to create role');
    }
  },

  getPermissionAuditLogs: async (filters: any = {}): Promise<any[]> => {
    try {
      const response = await api.get('/rbac/audit-logs/', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch permission audit logs');
    }
  }
};

export default adminPromotionService;