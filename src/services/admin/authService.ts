import api from '../api'; // Adjust path if needed
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  profile: {
    first_name: string;
    last_name: string;
    full_name: string;
    phone_number: string;
    address: string;
    age: number;
    gender: string;
    role: string;
    website: string;
    bio: string;
    photo: string;
  };
  is_staff: boolean;
  is_superuser: boolean;
}

interface LoginResponse {
  refresh_token: string;
  access_token: string;
  user: User;
  is_admin: boolean;
}

const authService = {
  // Generic login method that can handle both regular and admin logins
  login: async (credentials: { email_or_username: string; password: string }, isAdmin: boolean = false): Promise<LoginResponse> => {
    try {
      const endpoint = isAdmin ? '/auth/admin/login/' : '/auth/login/';
      const response = await api.post(endpoint, credentials);
      const data = response.data;

      // Validate the response structure
      if (!data.access_token || !data.refresh_token || !data.user) {
        throw new Error('Invalid login response from server');
      }

      // Store tokens and user data in cookies
      Cookies.set('access_token', data.access_token, { expires: 1 / 24 }); // 1 hour expiry
      Cookies.set('refresh_token', data.refresh_token, { expires: 7 }); // 7 days expiry
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });

      return data;
    } catch (error: any) {
      console.error(`${isAdmin ? 'Admin' : 'Regular'} login error:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || `${isAdmin ? 'Admin' : 'Regular'} login failed. Please check your credentials.`);
    }
  },

  // Keep adminLogin for backward compatibility or specific admin logic if needed
  adminLogin: async (email: string, password: string): Promise<LoginResponse> => {
    return authService.login({ email_or_username: email, password }, true);
  },

  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
  },
};

export default authService;