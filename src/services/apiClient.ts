// // Fix for API baseURL in axios configuration
// // Create or modify this file based on your project structure

// import axios from 'axios';

// // Define base API URL without trailing /api
// const API_BASE_URL = 'http://127.0.0.1:8080';  // Base URL without trailing slash

// // Create axios instance with proper configuration
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add request interceptor to include auth token
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('auth_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for handling common errors
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle common errors
//     if (error.response) {
//       if (error.response.status === 401) {
//         // Handle unauthorized
//         console.log('Session expired. Please login again.');
//         // You might want to redirect to login page or clear auth state
//         localStorage.removeItem('auth_token');
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;