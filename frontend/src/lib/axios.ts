import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // This allows cookies to be sent with cross-origin requests
  // which is necessary for our refresh token cookie
  withCredentials: true, 
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token using the httpOnly cookie
        const response = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        
        const { access_token } = response.data;
        
        // Update store with new token
        useAuthStore.getState().setAccessToken(access_token);
        
        // Update the original request's authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        useAuthStore.getState().logout();
        
        // Optionally redirect to login page (can also be handled in a router guard)
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
