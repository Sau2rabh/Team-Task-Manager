"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  LogOut, 
  Users,
  CheckSquare,
  Moon,
  Sun,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/projects' },
  { icon: CheckSquare, label: 'My Tasks', href: '/my-tasks' },
  { icon: Users, label: 'Team', href: '/team' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { logout, user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed md:sticky top-4 z-50 transition-all duration-300 ease-in-out",
        "w-64 h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] glass flex flex-col m-2 md:m-4 rounded-[2.5rem]",
        isOpen ? "left-0" : "-left-80 md:left-0"
      )}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-xl font-black text-gradient tracking-tight whitespace-nowrap">
            Team Task Manager
          </h1>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-2 hover:bg-secondary rounded-xl transition-colors">
              <LogOut size={20} className="rotate-180" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems
            .filter(item => !(user?.role === 'admin' && item.label === 'My Tasks'))
            .map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <motion.div
                  key={item.href}
                  initial={{ perspective: 1000 }}
                  whileHover={{ x: 6, scale: 1.02, rotateY: -5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden",
                      isActive 
                        ? "bg-primary/10 text-primary shadow-lg shadow-primary/5 border border-primary/20" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 w-1.5 h-full bg-primary rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}

          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Admin Controls</p>
              {[
                { href: '/admin/users', label: 'User Management', icon: Users, color: 'text-amber-500' },
                { href: '/admin/analytics', label: 'System Analytics', icon: BarChart3, color: 'text-indigo-400' }
              ].map((adminItem) => {
                const isActive = pathname === adminItem.href;
                return (
                  <motion.div
                    key={adminItem.href}
                    initial={{ perspective: 1000 }}
                    whileHover={{ x: 6, scale: 1.02, rotateY: -5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="mt-1"
                  >
                    <Link
                      href={adminItem.href}
                      onClick={() => onClose?.()}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group",
                        isActive 
                          ? "bg-primary/10 text-primary shadow-lg shadow-primary/5 border border-primary/20" 
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <adminItem.icon 
                        size={20} 
                        className={cn(
                          "transition-transform group-hover:scale-110",
                          isActive ? "text-primary" : `${adminItem.color}/70 group-hover:${adminItem.color}`
                        )} 
                      />
                      <span className={cn(isActive ? "text-primary" : "")}>{adminItem.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon size={18} className="text-primary" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <div className={cn(
              "w-8 h-4 rounded-full relative transition-all duration-300 border",
              theme === 'dark' ? "bg-primary border-primary" : "bg-slate-200 border-slate-300"
            )}>
              <div className={cn(
                "absolute top-px w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm",
                theme === 'dark' ? "left-4 bg-white" : "left-0.5 bg-slate-500"
              )} />
            </div>
          </button>

          <div className="space-y-2">
            <Link 
              href="/profile"
              className="glass-card p-4 rounded-2xl block hover:bg-secondary/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.profilePicture}` : user.profilePicture} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shadow-lg border border-primary/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20 text-white">
                      {user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-background rounded-full shadow-sm",
                    user?.status === 'Focus Mode' ? "bg-amber-500" : 
                    user?.status === 'In a Meeting' ? "bg-rose-500" : 
                    user?.status === 'Out of Office' ? "bg-slate-500" : "bg-emerald-500"
                  )} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user?.name || 'User'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role || 'Member'}</span>
                    <span className="text-[10px] font-bold text-amber-500">Lv.{user?.level || 1}</span>
                  </div>
                  {/* XP Progress Bar */}
                  <div className="mt-1.5 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
                      className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                    />
                  </div>
                </div>
              </div>
            </Link>

            {/* Status Quick Select */}
            <div className="flex items-center justify-around p-1.5 bg-secondary/30 rounded-xl border border-white/5">
              {[
                { name: 'Available', color: 'bg-emerald-500', title: 'Available' },
                { name: 'Focus Mode', color: 'bg-amber-500', title: 'Focus Mode' },
                { name: 'In a Meeting', color: 'bg-rose-500', title: 'In a Meeting' },
                { name: 'Out of Office', color: 'bg-slate-500', title: 'Out of Office' },
              ].map((s) => (
                <button
                  key={s.name}
                  onClick={async () => {
                    try {
                      const { data } = await api.put('/users/profile', { status: s.name });
                      updateUser({ status: s.name });
                      toast.success(`Status updated to ${s.name}`);
                    } catch (e) {
                      toast.error('Failed to update status');
                    }
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-125",
                    user?.status === s.name ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-40"
                  )}
                  title={s.title}
                >
                  <div className={cn("w-2.5 h-2.5 rounded-full", s.color)} />
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 font-medium group"
          >
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};


export default Sidebar;
