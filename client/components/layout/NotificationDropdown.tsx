"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Clock, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { socketService } from '@/lib/socket';

interface Notification {
  _id: string;
  type: 'PROJECT_ASSIGNED' | 'TASK_ASSIGNED' | 'STATUS_UPDATE' | 'TASK_COMPLETED';
  message: string;
  isRead: boolean;
  createdAt: string;
  projectId?: string;
}

const NotificationDropdown = ({ user }: { user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Listen for real-time notifications
    socketService.on('notification', (newNotif: Notification) => {
      setNotifications(prev => [newNotif, ...prev]);
      // Optional: show a small toast if dropdown is closed
      if (!isOpen) {
        toast(newNotif.message, { icon: <Bell size={16} className="text-primary" /> });
      }
    });

    socketService.on('broadcast_notification', (data: any) => {
      fetchNotifications(); // Reload all since broadcast affects everyone
    });

    return () => {
      socketService.off('notification');
      socketService.off('broadcast_notification');
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_ASSIGNED': return <Zap className="text-purple-500" size={16} />;
      case 'TASK_ASSIGNED': return <AlertCircle className="text-blue-500" size={16} />;
      case 'TASK_COMPLETED': return <CheckCircle2 className="text-emerald-500" size={16} />;
      default: return <Clock className="text-primary" size={16} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 hover:bg-secondary rounded-xl transition-all group active:scale-95"
      >
        <Bell size={18} className={`transition-colors ${isOpen ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 sm:w-96 glass border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {loading ? (
                <div className="py-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                    <Bell size={24} />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-2xl transition-all group relative ${n.isRead ? 'opacity-60' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 p-2 rounded-xl h-fit ${n.isRead ? 'bg-secondary' : 'bg-primary/10'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${n.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n._id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/5 bg-white/2 text-center">
              <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                View all activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
