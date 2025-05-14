import api from '../api';

interface Role {
  id: number;
  name: string;
  permissions: number[];
}

const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/auth/roles/');
    return response.data;
  },
  createRole: async (data: Partial<Role>): Promise<Role> => {
    const response = await api.post('/auth/roles/create/', data);
    return response.data;
  },
  updateRole: async (id: number, data: Partial<Role>): Promise<Role> => {
    const response = await api.put(`/auth/roles/${id}/`, data);
    return response.data;
  },
  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/auth/roles/${id}/`);
  },
  getRolePermissions: async (id: number): Promise<number[]> => {
    const response = await api.get(`/auth/roles/${id}/permissions/`);
    return response.data.permissions;
  },
  updateRolePermissions: async (id: number, permissions: number[]): Promise<void> => {
    await api.put(`/auth/roles/${id}/permissions/`, { permissions });
  },
};

export default roleService;