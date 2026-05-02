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
  const { logout, user } = useAuth();
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
        "w-64 h-[calc(100vh-2rem)] glass flex flex-col m-4 rounded-[2.5rem]",
        isOpen ? "left-0" : "-left-80 md:left-0"
      )}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient tracking-tight whitespace-nowrap">
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
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-sm" 
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
              );
            })}

          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Admin Controls</p>
              <Link
                href="/admin/users"
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group",
                  pathname === '/admin/users' 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Users 
                  size={20} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    pathname === '/admin/users' ? "text-primary" : "text-amber-500/70 group-hover:text-amber-500"
                  )} 
                />
                <span className={cn(pathname === '/admin/users' ? "text-primary" : "")}>User Management</span>
              </Link>
              <Link
                href="/admin/analytics"
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group mt-1",
                  pathname === '/admin/analytics' 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <BarChart3 
                  size={20} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    pathname === '/admin/analytics' ? "text-primary" : "text-indigo-400/70 group-hover:text-indigo-400"
                  )} 
                />
                <span className={cn(pathname === '/admin/analytics' ? "text-primary" : "")}>System Analytics</span>
              </Link>
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

          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20 text-white">
                {user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{user?.role || 'Member'}</p>
              </div>
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
