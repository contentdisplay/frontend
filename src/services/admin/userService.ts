// services/admin/userService.ts
import api from '../api';
import { UserProfile } from '../profileService';

export interface User {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  profile: UserProfile;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  profile?: {
    role: string;
  };
}

const userService = {
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/auth/admin/users/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get users', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch users');
    }
  },

  getUser: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/auth/admin/users/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get user', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user');
    }
  },

  createUser: async (userData: CreateUserPayload): Promise<User> => {
    try {
      const response = await api.post('/auth/register/', userData);
      return response.data.user;
    } catch (error: any) {
      console.error('Failed to create user', error);
      throw new Error(error.response?.data?.detail || 'Failed to create user');
    }
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.patch(`/auth/admin/users/${id}/`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user', error);
      throw new Error(error.response?.data?.detail || 'Failed to update user');
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/auth/admin/users/${id}/`);
    } catch (error: any) {
      console.error('Failed to delete user', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete user');
    }
  },

  getPendingPromotions: async (): Promise<{
    id: number;
    username: string;
    email: string;
    status: string;
    requested_at: string;
  }[]> => {
    try {
      const response = await api.get('/auth/promotions/pending/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get pending promotions', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch pending promotions');
    }
  },

  approvePromotion: async (id: number): Promise<{ detail: string }> => {
    try {
      const response = await api.post(`/auth/promotions/approve/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to approve promotion', error);
      throw new Error(error.response?.data?.detail || 'Failed to approve promotion');
    }
  },

  rejectPromotion: async (id: number, reason: string): Promise<{ detail: string }> => {
    try {
      const response = await api.post(`/auth/promotions/reject/${id}/`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Failed to reject promotion', error);
      throw new Error(error.response?.data?.detail || 'Failed to reject promotion');
    }
  }
};

export default userService;