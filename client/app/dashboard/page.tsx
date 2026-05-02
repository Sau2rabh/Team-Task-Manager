"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { 
  CheckCircle2, 
  AlertCircle, 
  Briefcase,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  myTasks: number;
  overdueTasks: number;
  performanceIncrease: string;
  insights: {
    urgentTask: string;
    suggestedFocus: string;
    productivityTip: string;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tasks/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: Briefcase, color: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: Clock, color: 'text-blue-400', glow: 'shadow-blue-500/10' },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertCircle, color: 'text-rose-400', glow: 'shadow-rose-500/10' },
  ].filter(card => !(user?.role === 'admin' && card.label === 'My Tasks'));

  const progress = stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <MainLayout>
      <div className="space-y-10 py-4">
        <motion.header
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
              Overview
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            A quick look at your workspace metrics and recent activity.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className={`glass-card p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group ${stat.glow}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:opacity-[0.08]" />
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} border border-white/5 transition-transform group-hover:scale-110 duration-500`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black mt-1">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 glass-card p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold">Overall Performance</h3>
                <p className="text-sm text-muted-foreground mt-1">Real-time completion analytics</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <ArrowUpRight size={14} />
                <span>+{stats?.performanceIncrease || '0.0'}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black tracking-tighter">{progress}%</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Efficiency</p>
                  </div>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {user?.role === 'admin' ? 'The team has' : "You've"} completed <span className="text-foreground font-bold">{stats?.completedTasks || 0}</span> tasks out of <span className="text-foreground font-bold">{stats?.totalTasks || 0}</span> total tasks across all active projects.
                  </p>
                </div>
              </div>
              
              <div className="relative w-[200px] h-[200px] mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-primary/10"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 80}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 80) * (1 - Math.max(0.01, progress) / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <TrendingUp className="text-primary mb-1" size={24} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>

            <div className="mt-12 h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-8 rounded-3xl flex flex-col justify-between border border-border group relative overflow-hidden"
          >
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
            
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">AI Insights</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stats?.insights?.productivityTip || "Our analysis suggests you're most productive between 9 AM - 11 AM."}
              </p>
            </div>
            
            <div className="my-8 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Priority Recommendation</p>
              <div className="bg-secondary border border-border p-5 rounded-2xl transition-all group-hover:border-primary/30">
                <p className="font-bold text-foreground text-lg">{stats?.insights?.urgentTask || "No urgent tasks"}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                  Suggested focus: <span className="text-primary font-bold">{stats?.insights?.suggestedFocus}</span> project.
                </p>
              </div>
            </div>

            <Link href="/ai-roadmap">
              <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20">
                Explore Roadmap
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
