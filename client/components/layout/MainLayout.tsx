"use client";

import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import NebulaBackground from '../ui/NebulaBackground';
import LoadingScreen from '../ui/LoadingScreen';
import api from '@/lib/api';
import { toast, Toaster } from 'sonner';
import { Bell, Menu, X, Zap, Radio } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ChatWidget from './ChatWidget';
import { socketService } from '@/lib/socket';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Dynamic breadcrumbs logic
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Overview';
    
    if (parts[0] === 'dashboard') return 'Dashboard';
    if (parts[0] === 'projects' && parts.length === 1) return 'Projects';
    if (parts[0] === 'projects' && parts.length > 1) return 'Project Details';
    if (parts[0] === 'my-tasks') return 'My Tasks';
    if (parts[0] === 'team') return 'Team';
    if (parts[0] === 'profile') return 'Profile';
    if (parts[0] === 'admin') {
      if (parts[1] === 'users') return 'User Management';
      if (parts[1] === 'analytics') return 'System Analytics';
      return 'Admin';
    }

    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      checkNotifications();
      
      // Socket connection
      const socket = socketService.connect();
      socketService.join(user);

      socketService.on('receiveBroadcast', (data) => {
        toast(`Admin Broadcast from ${data.sender}`, {
          description: data.message,
          icon: <Radio className="text-red-500 animate-pulse" size={18} />,
          duration: 10000,
          style: {
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.05)',
          }
        });
      });

      return () => {
        socketService.disconnect();
      };
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
      
      <main className="flex-1 flex flex-col h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] overflow-hidden relative m-2 md:my-4 md:mr-4 md:ml-0 rounded-3xl md:rounded-[2.5rem] glass md:border md:border-white/5 md:shadow-2xl md:shadow-black/20">
        {/* Top Header (Desktop & Mobile) */}
        <header className="glass m-2 mb-0 md:m-0 md:p-8 md:rounded-none md:bg-transparent md:border-b md:border-white/5 md:backdrop-blur-none flex items-center justify-between z-30">
          <div className="flex items-center gap-1 sm:gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden group/brand">
              <span className="text-[9px] min-[450px]:text-[10px] sm:text-sm font-black text-primary uppercase tracking-tight hidden min-[360px]:block shrink-0 transition-all duration-300 group-hover/brand:text-indigo-500 [text-shadow:0_1px_1px_rgba(0,0,0,0.05)]">Team Task Manager</span>
              <span className="text-muted-foreground/30 hidden min-[360px]:block shrink-0">/</span>
              <span className="text-[9px] min-[450px]:text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-widest truncate">{getPageTitle()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notification Bell */}
            <NotificationDropdown user={user} />
            
            <div className="hidden min-[400px]:block w-px h-6 bg-border mx-0.5 sm:mx-1"></div>
            
            <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
              <div className="text-right">
                <p className="text-[10px] sm:text-xs font-bold text-foreground leading-tight truncate max-w-[60px] min-[400px]:max-w-[100px] sm:max-w-[150px]">{user?.name}</p>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight uppercase tracking-tighter truncate">System {user?.role}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow-lg shadow-primary/20 border border-white/10 shrink-0">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
          <Toaster theme={theme as any} position="bottom-right" closeButton richColors />
          <ChatWidget />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
