"use client";

import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import NebulaBackground from '../ui/NebulaBackground';
import LoadingScreen from '../ui/LoadingScreen';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import { Bell, Menu, X, Zap } from 'lucide-react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      checkNotifications();
    }
  }, [user]);

  const checkNotifications = async () => {
    try {
      const { data: notifications } = await api.get('/notifications');
      const unread = notifications.filter((n: any) => !n.isRead);
      
      unread.forEach((n: any) => {
        toast(n.message, {
          icon: <Bell className="text-primary" size={18} />,
          duration: 6000,
          action: {
            label: 'Mark as Read',
            onClick: () => markAsRead(n._id),
          },
        });
      });

      // Auto mark as read if you want, but better to let user do it or mark all as read
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  if (loading && !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <NebulaBackground />
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative font-sans">
      <NebulaBackground />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden glass m-4 mb-0 p-4 rounded-2xl flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-white" size={16} fill="currentColor" />
            </div>
            <span className="font-bold tracking-tight">Task Manager</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
          <Toaster theme={theme as any} position="bottom-right" closeButton richColors />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
