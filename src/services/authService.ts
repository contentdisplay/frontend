// services/authService.ts
import api from './api';
import Cookies from 'js-cookie';

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  promo_code?: string;
}

interface LoginPayload {
  email_or_username: string;
  password: string;
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
  promo_bonus?: {
    code: string;
    amount: string;
    message: string;
  };
}

interface VerifyEmailResponse {
  message: string;
}

interface PromoCodeValidationResponse {
  valid: boolean;
  message: string;
}

interface GoogleAuthResponse extends AuthResponse {
  message: string;
}

// Helper function to decode JWT token and get user info
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Helper function to get access token from Google credential
const getGoogleAccessToken = async (credential: string): Promise<string> => {
  try {
    // For Google Identity Services, we need to exchange the credential for an access token
    // The credential is actually a JWT token from Google, we'll send it directly to our backend
    return credential;
  } catch (error) {
    throw new Error('Failed to get Google access token');
  }
};
  
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

  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    try {
      const response = await api.get(`/auth/verify-email/${token}/`);
      return response.data;
    } catch (error: any) {
      console.error("Email verification error:", error.response?.data);
      throw new Error(error.response?.data?.detail || 'Email verification failed.');
    }
  },
  
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const data = response.data;
      
      Cookies.set('access_token', data.access_token, { expires: 1/24 });
      Cookies.set('refresh_token', data.refresh_token, { expires: 7 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
      
      return data;
    } catch (error: any) {
      console.error("Login error details:", error.response?.data);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  },

  // NEW: Google Sign-In method
  googleSignIn: async (credential: string): Promise<GoogleAuthResponse> => {
    try {
      console.log("Starting Google Sign-In process...");
      
      // Send the credential directly to our backend
      const response = await api.post('/auth/google/', {
        access_token: credential
      });
      
      const data = response.data;
      
      // Store tokens and user data same as regular login
      Cookies.set('access_token', data.access_token, { expires: 1/24 });
      Cookies.set('refresh_token', data.refresh_token, { expires: 7 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
      
      console.log("Google Sign-In successful:", data);
      return data;
    } catch (error: any) {
      console.error("Google Sign-In error:", error.response?.data);
      const errorMessage = error.response?.data?.error || 
        error.response?.data?.detail || 
        'Google Sign-In failed. Please try again.';
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
    
    // Sign out from Google if available
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.log('Google sign out error:', error);
      }
    }
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
  
  validatePromoCode: async (code: string): Promise<PromoCodeValidationResponse> => {
    try {
      const response = await api.post('/auth/promo-code/validate/', { code });
      return response.data;
    } catch (error: any) {
      console.error("Promo code validation error:", error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to validate promo code.');
    }
  },
  
  requestWriterPromotion: async (): Promise<any> => {
    try {
      const response = await api.post('/auth/promotions/request/');
      return response.data;
    } catch (error: any) {
      console.error("Promotion request error:", error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to request promotion to content writer.');
    }
  },
  
};

export default authService;
export type { 
  RegisterPayload, 
  LoginPayload, 
  AuthResponse, 
  RegisterResponse, 
  VerifyEmailResponse,
  GoogleAuthResponse
};