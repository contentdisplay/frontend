import api from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  profile: {
    role: string;
  };
}

const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users/');
    return response.data;
  },
  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}/`);
    return response.data;
  },
  createUser: async (data: Partial<User>): Promise<User> => {
    const response = await api.post('/admin/users/', data);
    return response.data;
  },
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/users/${id}/`, data);
    return response.data;
  },
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}/`);
  },
};

export default userService;