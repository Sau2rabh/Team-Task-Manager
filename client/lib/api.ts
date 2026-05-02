import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('team_task_manager_user');
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      config.headers.Authorization = `Bearer ${token}`;
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
