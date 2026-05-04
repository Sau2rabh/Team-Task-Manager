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
  ArrowDownRight,
  Activity,
  User as UserIcon,
  Search,
  Plus,
  Users,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  myTasks: number;
  overdueTasks: number;
  performanceIncrease: string;
  trends: {
    total: string;
    completed: string;
    inProgress: string;
    overdue: string;
  };
  chartData: Array<{ name: string; completed: number; active: number }>;
  teamActivity: Array<{
    user: string;
    action: string;
    task: string;
    project: string;
    timestamp: string;
  }>;
  memberWorkload: Array<{
    _id: string;
    name: string;
    taskCount: number;
    completedCount: number;
    progress: number;
  }>;
  upcomingTasks: Array<{
    _id: string;
    title: string;
    dueDate: string;
    priority: string;
  }>;
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
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: Briefcase, color: 'text-indigo-400', glow: 'shadow-indigo-500/10', trend: stats?.trends.total },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, icon: Clock, color: 'text-blue-400', glow: 'shadow-blue-500/10', trend: stats?.trends.inProgress },
    { label: 'Completed', value: stats?.completedTasks || 0, icon: CheckCircle2, color: 'text-emerald-400', glow: 'shadow-emerald-500/10', trend: stats?.trends.completed },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertCircle, color: 'text-rose-400', glow: 'shadow-rose-500/10', trend: stats?.trends.overdue },
  ].filter(card => !(user?.role === 'admin' && card.label === 'My Tasks'));

  const progress = stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <MainLayout>
      <div className="space-y-10 py-4">
        <motion.header
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                Command Center
              </span>
              <div className="h-px w-12 bg-white/5" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-gradient">{user?.name.split(' ')[0]}</span> 👋
            </h2>
            <p className="text-muted-foreground text-lg">
              A quick look at your workspace metrics and recent activity.
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className="flex items-center gap-3">
            <Link href="/projects">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-bold group">
                <Plus size={18} className="text-primary group-hover:rotate-90 transition-transform" />
                New Project
              </button>
            </Link>
            <Link href="/team">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground transition-all text-sm font-bold hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
                <Users size={18} />
                Invite Team
              </button>
            </Link>
          </div>
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
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} border border-white/5 transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon size={24} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                    stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </div>
                )}
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
              <div className="space-y-8">
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black tracking-tighter">{progress}%</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Efficiency</p>
                  </div>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {user?.role === 'admin' ? 'The team has' : "You've"} completed <span className="text-foreground font-bold">{stats?.completedTasks || 0}</span> tasks out of <span className="text-foreground font-bold">{stats?.totalTasks || 0}</span> total tasks.
                  </p>
                </div>

                {/* Mini Area Chart */}
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.chartData || []}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis 
                        dataKey="name" 
                        hide 
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1e2e', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#818cf8" 
                        fillOpacity={1} 
                        fill="url(#colorCompleted)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="relative w-[220px] h-[220px] mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="110"
                    cy="110"
                    r="90"
                    stroke="currentColor"
                    strokeWidth="14"
                    fill="transparent"
                    className="text-primary/10"
                  />
                  <motion.circle
                    cx="110"
                    cy="110"
                    r="90"
                    stroke="url(#gradient)"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 90}
                    initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 90) * (1 - Math.max(0.01, progress) / 100) }}
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

          {/* Team Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2 glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Activity size={20} />
                </div>
                <h3 className="text-xl font-bold">Team Activity Pulse</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
                Live Feed
              </span>
            </div>

            <div className="space-y-4">
              {stats?.teamActivity && stats.teamActivity.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {stats.teamActivity.map((activity, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-primary border border-primary/10">
                        {activity.user.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-tight">
                          <span className="font-bold text-foreground">{activity.user}</span>
                          <span className="text-muted-foreground mx-1.5">{activity.action}</span>
                          <span className="font-bold text-primary">{activity.task}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="uppercase tracking-tighter font-medium">{activity.project}</span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-10 text-center text-muted-foreground italic">
                  No recent team activity found.
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-8"
          >
            {/* Upcoming Deadlines */}
            <div className="glass-card p-6 rounded-3xl border border-border group relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Calendar size={16} className="text-rose-400" />
                  Upcoming
                </h3>
                <Link href="/my-tasks" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                {stats?.upcomingTasks && stats.upcomingTasks.length > 0 ? (
                  stats.upcomingTasks.map((task) => (
                    <div key={task._id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all group/task">
                      <p className="text-sm font-bold truncate">{task.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-rose-400 font-medium">
                          Due {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black ${
                          task.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No urgent deadlines.</p>
                )}
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between border border-border group relative overflow-hidden bg-linear-to-br from-primary/5 to-transparent">
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
            </div>
          </motion.div>
        </div>

        {/* Member Workload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-card p-8 rounded-[2.5rem] border border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Users size={20} />
              </div>
              <h3 className="text-xl font-bold">Team Workload Distribution</h3>
            </div>
            <Link href="/team" className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              Manage Team <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats?.memberWorkload && stats.memberWorkload.length > 0 ? (
              stats.memberWorkload.map((member) => (
                <div key={member._id} className="p-5 rounded-3xl bg-white/2 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/10">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{member.taskCount} Active Tasks</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-muted-foreground uppercase tracking-wider">Completion</span>
                      <span className="text-primary">{member.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${member.progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-muted-foreground italic">
                No active workload data available.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
