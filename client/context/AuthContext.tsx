"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { socketService } from '@/lib/socket';

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  role?: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  xp?: number;
  level?: number;
  status?: string;
  statusIcon?: string;
  gender?: string;
  dateOfBirth?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('team_task_manager_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        try {
          // Verify and sync with server
          const { data } = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${parsedUser.token}` }
          });
          const updatedUser = { ...parsedUser, ...data };
          setUser(updatedUser);
          localStorage.setItem('team_task_manager_user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Failed to sync user profile', error);
          // If token is invalid, logout might happen via interceptors or we handle here
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    socketService.on('user_update', (data: { xp: number, level: number }) => {
      updateUser(data);
    });

    return () => {
      socketService.off('user_update');
    };
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('team_task_manager_user', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('team_task_manager_user');
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('team_task_manager_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
