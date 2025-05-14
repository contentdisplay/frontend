import api from '../api';

interface PromotionRequest {
  id: number;
  user: {
    id: number;
    username: string;
  };
  status: string;
  requested_at: string;
  reviewed_at: string | null;
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

  approvePromotion: async (promotionId: number, status: 'approved' | 'rejected'): Promise<any> => {
    try {
      const response = await api.post(`/auth/promotions/approve/${promotionId}/`, { status });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to ${status} promotion:`, error.response?.data);
      throw new Error(error.response?.data?.detail || `Failed to ${status} promotion request`);
    }
  },

  getUserProfile: async (userId: number): Promise<any> => {
    try {
      const response = await api.get(`/auth/admin/users/${userId}/profile/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  },

  getUserWallet: async (userId: number): Promise<any> => {
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