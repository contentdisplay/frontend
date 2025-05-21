// services/api.ts

import axios from 'axios';
import Cookies from 'js-cookie';

// const api = axios.create({
//   baseURL: 'https://api.writelyrewarded.digital/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const api = axios.create({
//   baseURL: 'https://writelyrewarded.digital/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const api = axios.create({
  baseURL: 'http://cc44s4g0okcsgg4ksws480ws.93.127.128.12.sslip.io/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth tokens
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // const response = await axios.post('https://api.writelyrewarded.digital/api/auth/token/refresh/', {
        //   refresh: refreshToken,
        // });
        
        // const response = await axios.post('https://writelyrewarded.digital/api/auth/token/refresh/', {
        //   refresh: refreshToken,
        // });
        const response = await axios.post('http://cc44s4g0okcsgg4ksws480ws.93.127.128.12.sslip.io/api/auth/token/refresh/', {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        
        // Update the cookie with new access token
        Cookies.set('access_token', access, { expires: 1/24 }); // 1 hour
        
        // Update the Authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, logout
        console.error('Token refresh failed:', refreshError);
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

