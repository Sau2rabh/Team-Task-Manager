import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('team_task_manager_user');
      if (storedUser) {
        const { token } = JSON.parse(storedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Error parsing user token', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

import { toast } from 'sonner';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url;
    const baseURL = originalRequest?.baseURL;
    const fullUrl = baseURL ? `${baseURL}${url}` : url;

    console.error(`🌐 API Error [${error.response?.status || 'Network Error'}]: ${fullUrl}`);
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('team_task_manager_user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403 && typeof window !== 'undefined') {
      toast.error('Access Denied: You do not have permission to perform this action.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
