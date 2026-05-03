"use client";

import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Loader2,
  Activity,
  Radio,
  Send,
  Circle,
  MessageSquare,
  Zap,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { socketService } from '@/lib/socket';
import { toast } from 'sonner';

interface UserAnalytics {
  _id: string;
  name: string;
  email: string;
  todo: number;
  inProgress: number;
  completed: number;
  total: number;
}

interface ActivityItem {
  type: string;
  data: any;
  timestamp: string;
}

interface ActiveUser {
  userId: string;
  name: string;
  role: string;
  socketId: string;
}

const COLORS = ['#818cf8', '#fbbf24', '#34d399'];

interface ProjectAnalytics {
  _id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  status: string;
}

export default function AdminAnalyticsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState<UserAnalytics[]>([]);
  const [projectData, setProjectData] = useState<ProjectAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Suppress Recharts dimension warnings permanently
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')) {
        return;
      }
      originalWarn(...args);
    };

    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/dashboard');
    }

    return () => {
      console.warn = originalWarn;
    };
  }, [currentUser, authLoading, router]);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    
    // Connect and Join
    if (currentUser) {
      const socket = socketService.connect();
      socketService.join(currentUser);
      
      setIsConnected(socket.connected);
      
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    }
    
    // Socket listeners
    socketService.on('activeUsersUpdate', (users) => {
      setActiveUsers(users);
    });

    socketService.on('activity', (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 50));
      // Refresh stats on relevant activities
      if (['TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'PROJECT_CREATED', 'PROJECT_DELETED', 'MEMBER_ADDED'].includes(activity.type)) {
        fetchAnalytics();
      }
    });

    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
      socketService.off('activeUsersUpdate');
      socketService.off('activity');
    };
  }, [currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activities]);

  const fetchAnalytics = async (isManual = false) => {
    try {
      if (isManual) {
        toast.loading('Refreshing analytics...', { id: 'refresh-analytics' });
      }
      const response = await api.get('/admin/analytics');
      // The backend now returns { userStats, projectStats }
      if (response.data.userStats) {
        setData(response.data.userStats);
        setProjectData(response.data.projectStats || []);
        if (response.data.recentActivities) {
          setActivities(response.data.recentActivities);
        }
      } else {
        // Fallback for old structure
        setData(response.data);
      }
      
      if (isManual) {
        toast.success('Analytics updated!', { id: 'refresh-analytics' });
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      if (isManual) {
        toast.error('Failed to refresh data', { id: 'refresh-analytics' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setIsSending(true);
    
    try {
      // 1. Save to database for persistence
      await api.post('/notifications/broadcast', { message: broadcastMsg });
      
      // 2. Emit via socket for real-time delivery
      socketService.emit('adminBroadcast', { message: broadcastMsg });
      
      toast.success('Broadcast sent and saved successfully!');
      setBroadcastMsg('');
    } catch (error) {
      console.error('Broadcast failed', error);
      toast.error('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || (currentUser && currentUser.role !== 'admin')) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const aggregateData = [
    { name: 'Todo', value: data.reduce((acc, curr) => acc + curr.todo, 0) },
    { name: 'In Progress', value: data.reduce((acc, curr) => acc + curr.inProgress, 0) },
    { name: 'Completed', value: data.reduce((acc, curr) => acc + curr.completed, 0) },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'TASK_CREATED': return <Plus size={14} className="text-blue-500" />;
      case 'TASK_UPDATED': return <RefreshCw size={14} className="text-amber-500" />;
      case 'TASK_DELETED': return <Trash2 size={14} className="text-red-500" />;
      case 'PROJECT_CREATED': return <Zap size={14} className="text-purple-500" />;
      default: return <Activity size={14} className="text-primary" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 py-4 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <BarChart3 className="text-primary" size={32} />
              Admin Command Center
            </h2>
            <p className="text-muted-foreground mt-1 font-medium">Welcome back, <span className="text-foreground font-bold">{currentUser?.name}</span>! System is performing optimally.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* System Health Monitor */}
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-4 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server Latency</span>
                <span className="text-xs font-bold text-foreground">24ms</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CPU Load</span>
                <span className="text-xs font-bold text-foreground">12%</span>
              </div>
            </div>
            {/* Socket Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Live: Connected' : 'Live: Disconnected'}
            </div>

            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{activeUsers.length} Online</span>
            </div>
            <button 
              onClick={() => fetchAnalytics(true)}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/5 group"
            >
              <RefreshCw size={16} className="group-active:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Analytics Section */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading ? (
              <div className="glass-card p-20 flex flex-col items-center justify-center gap-4 rounded-[2.5rem]">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground font-medium">Gathering intelligence...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Chart */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-8 rounded-[2.5rem] space-y-6"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle size={20} className="text-indigo-400" />
                    Overall Status
                  </h3>
                  <div className="h-72">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={aggregateData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {aggregateData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e1e2e', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={45} wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    )}
                  </div>
                </motion.div>

                {/* Broadcast Tool */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-8 rounded-[2.5rem] space-y-6"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Radio size={20} className="text-red-500" />
                    Global Broadcast
                  </h3>
                  <p className="text-sm text-muted-foreground">Send a real-time notification to all online users.</p>
                  
                  <div className="space-y-4">
                    <textarea 
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full bg-secondary/30 border border-border focus:border-primary/50 rounded-2xl p-4 text-sm outline-none resize-none h-32 transition-all"
                    />
                    <button 
                      onClick={handleBroadcast}
                      disabled={isSending || !broadcastMsg.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <Send size={18} />
                      Send Broadcast
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Productivity Chart */}
            {!isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-[2.5rem]"
              >
                <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  Team Productivity
                </h3>
                <div className="h-80">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e1e2e', border: 'none', borderRadius: '12px' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar dataKey="todo" name="Todo" fill="#818cf8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inProgress" name="In Progress" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#34d399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Live Feed & Active Users */}
          <div className="space-y-8">
            {/* Active Users */}
            <div className="glass-card p-6 rounded-[2.5rem] space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users size={16} className="text-emerald-500" />
                Active Now
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                {activeUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">No other users online.</p>
                ) : (
                  activeUsers.map((u) => (
                    <div key={u.socketId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {u.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] lg:text-xs font-bold whitespace-nowrap">{u.name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">{u.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="glass-card p-6 rounded-[2.5rem] flex flex-col h-[400px]">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                <Activity size={16} className="text-blue-500" />
                Live Activity
              </h3>
              <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {activities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <MessageSquare size={32} className="text-muted-foreground/20 mb-2" />
                    <p className="text-xs text-muted-foreground italic">Listening for system events...</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {activities.map((activity, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 p-3 rounded-2xl glass border border-white/5"
                      >
                        <div className="mt-1 p-1.5 bg-secondary rounded-lg h-fit">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] leading-tight">
                            <span className="font-bold text-primary">{activity.data.user}</span>
                            {" "}
                            {activity.type === 'TASK_CREATED' && "created task "}
                            {activity.type === 'TASK_UPDATED' && `updated task status to ${activity.data.status} `}
                            {activity.type === 'TASK_DELETED' && "deleted task "}
                            {activity.type === 'PROJECT_CREATED' && "created project "}
                            {activity.type === 'MEMBER_ADDED' && `added ${activity.data.member} to `}
                            <span className="font-bold">{activity.data.task || activity.data.project}</span>
                          </p>
                          <p className="text-[9px] text-muted-foreground">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Table */}
        {!isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 rounded-[2.5rem] overflow-hidden"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-400" />
              Member Performance
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 border-b border-border/50">
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Member</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Todo</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">In Progress</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Completed</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Total</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.map((u) => (
                    <tr key={u._id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/10">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold group-hover:text-primary transition-colors">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-medium text-center">{u.todo}</td>
                      <td className="px-8 py-5 font-medium text-center">{u.inProgress}</td>
                      <td className="px-8 py-5 font-medium text-center text-emerald-400">{u.completed}</td>
                      <td className="px-8 py-5 font-bold text-center">{u.total}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((u.completed / (u.total || 1)) * 100)}%` }}
                              className="h-full bg-primary"
                            />
                          </div>
                          <span className="text-xs font-bold w-12 text-right">
                            {Math.round((u.completed / (u.total || 1)) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Project Pulse Section */}
        {!isLoading && projectData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap size={24} className="text-purple-500" />
                Project Pulse
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectData.map((project, i) => (
                <motion.div 
                  key={project._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                  className="glass-card p-6 rounded-4xl border border-white/5 space-y-4 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                      <BarChart3 size={20} />
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md border ${
                      project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg group-hover:text-purple-400 transition-colors">{project.name}</h4>
                    <p className="text-xs text-muted-foreground">{project.completedTasks} of {project.totalTasks} tasks completed</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Progress</span>
                      <span className="text-sm font-black">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        className="h-full bg-linear-to-r from-purple-500 to-indigo-500"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
