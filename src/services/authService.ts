// authService.ts - Updated to use cookies
import api from './api';
import Cookies from 'js-cookie';

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  referral_code?: string;
}

interface LoginPayload {
  email_or_username: string;
  password: string;
}

interface OtpVerifyPayload {
  email: string;
  otp: string;
}

interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    groups: string[];
    is_staff: boolean;
    is_superuser: boolean;
  };
  access_token: string;
  refresh_token: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface OtpVerifyResponse {
  message: string;
  success: boolean;
}

const authService = {
  register: async (userData: RegisterPayload): Promise<RegisterResponse> => {
    const registrationData = {
      ...userData,
      nickname: userData.nickname || userData.username
    };
    
    console.log("Sending registration data:", registrationData);
    
    try {
      const response = await api.post('/auth/register/', registrationData);
      return response.data;
    } catch (error: any) {
      console.error("Registration error details:", error.response?.data);
      const errorMessage = error.response?.data?.detail || 
        (error.response?.data ? Object.values(error.response.data).flat().join(", ") : 
        'Registration failed. Please try again.');
      throw new Error(errorMessage);
    }
  },
  
  verifyOtp: async (otpData: OtpVerifyPayload): Promise<OtpVerifyResponse> => {
    const response = await api.post('/auth/otp/', otpData);
    return response.data;
  },
  
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const data = response.data;
      
      // Set cookies with appropriate expiry
      Cookies.set('access_token', data.access_token, { expires: 1/24 }); // 1 hour
      Cookies.set('refresh_token', data.refresh_token, { expires: 7 }); // 7 days
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
      
      return data;
    } catch (error: any) {
      console.error("Login error details:", error.response?.data);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  },
  
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
  },
  
  getCurrentUser: () => {
    const userStr = Cookies.get('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },
  
  // Add new method for content writer promotion request
  requestWriterPromotion: async (): Promise<any> => {
    try {
      const response = await api.post('/auth/promotions/request/');
      return response.data;
    } catch (error: any) {
      console.error("Promotion request error:", error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to request promotion to content writer.');
    }
  }
};

export default authService;
export type { 
  RegisterPayload, 
  LoginPayload, 
  OtpVerifyPayload, 
  AuthResponse, 
  RegisterResponse, 
  OtpVerifyResponse 
};