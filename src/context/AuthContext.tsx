import { createContext, useContext, useEffect, useState } from "react";
import { AuthState, User, UserRole } from "@/types/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import authService, { AuthResponse, RegisterResponse, VerifyEmailResponse } from "@/services/authService";
import Cookies from 'js-cookie';

interface AuthContextType extends AuthState {
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: UserRole, referralCode?: string) => Promise<string>;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<void>;
  requestWriterPromotion: () => Promise<void>;
  verifyEmail: (token: string) => Promise<VerifyEmailResponse>;
  googleSignIn: (credential: string) => Promise<void>; // NEW: Google Sign-In method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: Cookies.get("access_token"),
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("access_token");
      if (!token) {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      try {
        const userData = authService.getCurrentUser();
        
        if (userData) {
          setAuthState({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          Cookies.remove("user");
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        Cookies.remove("user");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    verifyToken();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await authService.login({
        email_or_username: emailOrUsername,
        password
      });
      
      // Determine user role from response
      const userRole = response.user.groups.includes('Content Writer') || 
                      response.user.role === 'writer' ? 'writer' : 
                      (response.user.is_staff || response.user.is_superuser ? 'admin' : 'user');
      
      const userData = {
        id: response.user.id.toString(),
        name: response.user.username,
        email: response.user.email,
        role: userRole as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
      };
      
      // Store user data in a cookie
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      
      setAuthState({
        user: userData,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success(`Welcome back, ${response.user.username}!`);
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate("/admin/dashboard");
      } else if (userRole === 'writer') {
        navigate("/writer/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      throw error;
    }
  };

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    role: UserRole = "user",
    referralCode?: string
  ): Promise<string> => {
    try {
      const response = await authService.register({
        username,
        email,
        password,
        nickname: username,
        promo_code: referralCode
      });
      
      toast.success("Registration successful! Please verify your email.");
      return response.user.email;
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.message || 
        (typeof error.response?.data === 'object' ? 
          Object.values(error.response.data).flat().join(", ") : 
          "Registration failed. Please try again.");
          
      toast.error(errorMessage);
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await authService.login({
        email_or_username: email,
        password
      });
      
      if (response.user.is_staff !== true && response.user.is_superuser !== true) {
        throw new Error("You do not have admin privileges");
      }
      
      const userData = {
        id: response.user.id.toString(),
        name: response.user.username,
        email: response.user.email,
        role: "admin" as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
      };
      
      // Store user data in a cookie
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      
      setAuthState({
        user: userData,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success("Welcome, Admin!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error(error.message || "Admin login failed. Please check your credentials.");
      throw error;
    }
  };

  // NEW: Google Sign-In method
  const googleSignIn = async (credential: string) => {
    try {
      const response = await authService.googleSignIn(credential);
      
      // Determine user role from response (same logic as regular login)
      const userRole = response.user.groups.includes('Content Writer') || 
                      response.user.role === 'writer' ? 'writer' : 
                      (response.user.is_staff || response.user.is_superuser ? 'admin' : 'user');
      
      const userData = {
        id: response.user.id.toString(),
        name: response.user.username,
        email: response.user.email,
        role: userRole as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
      };
      
      // Store user data in a cookie
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      
      setAuthState({
        user: userData,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success(`Welcome, ${response.user.username}!`);
      
      // Redirect based on role (same logic as regular login)
      if (userRole === 'admin') {
        navigate("/admin/dashboard");
      } else if (userRole === 'writer') {
        navigate("/writer/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      toast.error(error.message || "Google Sign-In failed. Please try again.");
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    toast.info("You have been logged out.");
    navigate("/");
  };

  const requestWriterPromotion = async () => {
    try {
      await authService.requestWriterPromotion();
      toast.success("Content writer promotion request submitted. An admin will review your request.");
    } catch (error: any) {
      console.error("Content writer promotion request error:", error);
      toast.error(error.message || "Failed to request promotion to content writer.");
      throw error;
    }
  };

  const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
    try {
      const response = await authService.verifyEmail(token);
      toast.success(response.message);
      return response;
    } catch (error: any) {
      console.error("Email verification error:", error);
      toast.error(error.message || "Email verification failed.");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        adminLogin,
        requestWriterPromotion,
        verifyEmail,
        googleSignIn, // NEW: Add googleSignIn to the context value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};