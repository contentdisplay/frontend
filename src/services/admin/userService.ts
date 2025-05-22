// services/admin/userService.ts
import api from '../api';

export interface User {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone_number?: string;
    address?: string;
    age?: number;
    gender?: string;
    role?: string;
    bio?: string;
    photo?: string;
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  profile: {
    role: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface UpdateUserData {
  username: string;
  email: string;
  profile: {
    role: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    age?: number;
    gender?: string;
    bio?: string;
  };
}

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

const userService = {
  // Get all users with pagination
  getUsers: async (url?: string): Promise<PaginatedUsers | User[]> => {
    try {
      const endpoint = url || '/auth/admin/users/';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch users');
    }
  },

  // Get single user details
  getUser: async (userId: number): Promise<User> => {
    try {
      const response = await api.get(`/auth/admin/users/${userId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user details');
    }
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<User> => {
    try {
      const response = await api.post('/auth/admin/users/create/', userData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.detail || 
        (error.response?.data ? Object.values(error.response.data).flat().join(", ") : 
        'Failed to create user');
      throw new Error(errorMessage);
    }
  },

  // Update user
  updateUser: async (userId: number, userData: UpdateUserData): Promise<User> => {
    try {
      const response = await api.put(`/auth/admin/users/${userId}/update/`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.detail || 
        (error.response?.data ? Object.values(error.response.data).flat().join(", ") : 
        'Failed to update user');
      throw new Error(errorMessage);
    }
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/auth/admin/users/${userId}/delete/`);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete user');
    }
  },

  // Update user role
  updateUserRole: async (userId: number, role: string): Promise<any> => {
    try {
      const response = await api.post(`/auth/admin/users/${userId}/role/`, { role });
      return response.data;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update user role');
    }
  },

  // Get user profile
  getUserProfile: async (userId: number): Promise<any> => {
    try {
      const response = await api.get(`/auth/admin/users/${userId}/profile/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  },

  // Get user wallet
  getUserWallet: async (userId: number): Promise<any> => {
    try {
      const response = await api.get(`/auth/admin/users/${userId}/wallet/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user wallet:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user wallet');
    }
  },

  // Bulk actions
  bulkActions: async (action: string, userIds: number[]): Promise<any> => {
    try {
      const response = await api.post('/auth/admin/users/bulk-actions/', {
        action,
        user_ids: userIds
      });
      return response.data;
    } catch (error: any) {
      console.error('Error performing bulk action:', error);
      throw new Error(error.response?.data?.detail || 'Failed to perform bulk action');
    }
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await api.get('/auth/admin/dashboard/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch dashboard statistics');
    }
  },
};

export default userService;