"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Pie,
  AreaChart,
  Area
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
  RefreshCw,
  Cpu,
  Database,
  HardDrive,
  ShieldCheck,
  Signal,
  Wifi,
  Terminal,
  Trophy,
  Rocket
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
  projects: string[];
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

const COLORS = ['#6366f1', '#f59e0b', '#10b981']; // More vibrant colors

interface ProjectAnalytics {
  _id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  status: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl min-w-[150px] z-50">
        {label && <p className="text-[10px] font-black text-white/50 border-b border-white/10 pb-2 mb-3 uppercase tracking-[0.2em]">{label}</p>}
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.fill || entry.color }} />
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{entry.name}</span>
              </div>
              <span className="text-xs font-black" style={{ color: entry.fill || entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [data, setData] = useState<UserAnalytics[]>([]);
  const [projectData, setProjectData] = useState<ProjectAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityTrend, setActivityTrend] = useState<any[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [systemHealth, setSystemHealth] = useState({
    cpu: '0%',
    memory: '0GB / 0GB',
    memoryPercent: 0,
    disk: '0%',
    latency: '0ms',
    throughput: '0 MB/s',
    activityTrend: [] as any[],
    status: 'Operational'
  });

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

  const fetchSystemHealth = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/system-health');
      setSystemHealth(data);
    } catch (error) {
      console.error('Failed to fetch system health', error);
    }
  }, []);

  const fetchAnalytics = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        toast.loading('Refreshing analytics...', { id: 'refresh-analytics' });
      }
      const response = await api.get('/admin/analytics');
      if (response.data.userStats) {
        setData(response.data.userStats);
        setProjectData(response.data.projectStats || []);
        setActivityTrend(response.data.activityTrend || []);
        if (response.data.recentActivities) {
          setActivities(response.data.recentActivities);
        }
      } else {
        setData(response.data);
      }
      
      setLastSync(new Date());
      if (isManual) {
        toast.success('Command Center Synced!', { id: 'refresh-analytics' });
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    }
  }, []);


  useEffect(() => {
    fetchAnalytics();
    fetchSystemHealth();

    const healthInterval = setInterval(fetchSystemHealth, 10000);
    let syncInterval: NodeJS.Timeout;
    
    // Connect and Join
    if (currentUser) {
      const socket = socketService.connect();
      
      const handleConnect = () => {
        setIsConnected(true);
        socketService.join(currentUser);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
      };

      // Set initial state
      setIsConnected(socket.connected);
      if (socket.connected) {
        socketService.join(currentUser);
      }

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      // Socket listeners
      const handleUsersUpdate = (users: any) => setActiveUsers(users);
      const handleActivity = (activity: any) => {
        setActivities(prev => [activity, ...prev].slice(0, 50));
        if (['TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'PROJECT_CREATED', 'PROJECT_DELETED', 'MEMBER_ADDED'].includes(activity.type)) {
          fetchAnalytics();
        }
      };

      socket.on('activeUsersUpdate', handleUsersUpdate);
      socket.on('activity', handleActivity);

      return () => {
        clearInterval(healthInterval);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('activeUsersUpdate', handleUsersUpdate);
        socket.off('activity', handleActivity);
      };
    }

    return () => clearInterval(healthInterval);
  }, [currentUser, fetchAnalytics, fetchSystemHealth]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activities]);


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
      <div className="space-y-8 py-4 pb-20 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xl:flex-row xl:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20 shadow-lg shadow-primary/5">
              <BarChart3 className="text-primary" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black tracking-tighter text-foreground">
                  ADMIN COMMAND CENTER
                </h2>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Operational</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
                <Clock size={14} />
                Last synchronized: <span className="text-foreground font-bold">{lastSync.toLocaleTimeString()}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">

            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-indigo-500/20">
              <div className="relative">
                <Users size={16} className="text-indigo-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-xs font-black text-foreground">{activeUsers.length} MEMBERS ACTIVE</span>
            </div>

            <button 
              onClick={() => fetchAnalytics(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 group"
            >
              <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
              Force Sync
            </button>
          </div>
        </motion.div>

        {/* 1. Smart Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'CPU LOAD', value: systemHealth.cpu, icon: Cpu, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: systemHealth.activityTrend },
            { label: 'NETWORK LATENCY', value: systemHealth.latency, icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: systemHealth.activityTrend },
            { label: 'MEMORY USAGE', value: systemHealth.memory, icon: Database, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: systemHealth.activityTrend },
            { label: 'DATA THROUGHPUT', value: systemHealth.throughput, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: systemHealth.activityTrend },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-4xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className={`p-3 ${stat.bg} rounded-2xl`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
                  <span className="text-2xl font-black tracking-tighter">{stat.value}</span>
                </div>
              </div>
              
              {/* Mini Sparkline */}
              <div className="h-12 mt-4 opacity-30 group-hover:opacity-60 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.trend}>
                    <Area type="monotone" dataKey="value" stroke={stat.color.replace('text-', '')} fill={stat.color.replace('text-', '')} fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] -mr-16 -mt-16 rounded-full pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 4. Advanced Analytics: Activity Trends */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  SYSTEM ACTIVITY TRENDS
                </h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Real-time action monitoring (24h)</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase">Trending Up</span>
              </div>
            </div>
            
            <div className="h-80 w-full">
              {isMounted && activityTrend.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityTrend}>
                    <defs>
                      <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="actions" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorActions)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 4. Advanced Analytics: Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-[2.5rem] border border-white/5"
          >
            <h3 className="text-xl font-black tracking-tighter flex items-center gap-2 mb-8">
              <Rocket size={20} className="text-indigo-400" />
              TASK DISTRIBUTION
            </h3>
            <div className="h-64 relative">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aggregateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {aggregateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black tracking-tighter">
                  {aggregateData.reduce((a, b) => a + b.value, 0)}
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Tasks</span>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              {aggregateData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2. System Terminal (Activity Feed) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-0 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-[500px]"
          >
            <div className="p-6 bg-secondary/80 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">System Terminal</h3>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 bg-secondary/30 p-6 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-3">
              {activities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                  <p>INITIALIZING LISTENER...</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {activities.map((activity, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 group"
                    >
                      <span className="text-foreground/40">[{new Date(activity.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-emerald-500 font-bold">{` > `}</span>
                      <p className="flex-1 text-foreground/80 group-hover:text-foreground transition-colors">
                        <span className="text-primary font-bold">{activity.data.user}</span>
                        {" "}
                        {activity.type === 'TASK_CREATED' && <span className="text-blue-400">CREATED_TASK</span>}
                        {activity.type === 'TASK_UPDATED' && <span className="text-amber-400">UPDATED_STATUS</span>}
                        {activity.type === 'TASK_DELETED' && <span className="text-red-400">DELETED_TASK</span>}
                        {activity.type === 'PROJECT_CREATED' && <span className="text-purple-400">NEW_PROJECT</span>}
                        {" :: "}
                        <span className="font-bold">{activity.data.task || activity.data.project}</span>
                        {activity.data.status && <span className="text-foreground/40 ml-2">({activity.data.status})</span>}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* 3. Interactive Transmission Center (Broadcast) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                  <Radio size={22} className="text-red-500 animate-pulse" />
                  TRANSMISSION CENTER
                </h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Dispatch global encrypted notifications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Secure Message Body</label>
                  <textarea 
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Enter broadcast content..."
                    className="w-full bg-secondary/50 border border-border focus:border-primary/50 rounded-3xl p-6 text-sm outline-none resize-none flex-1 min-h-[180px] transition-all font-medium text-foreground shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleBroadcast}
                  disabled={isSending || !broadcastMsg.trim()}
                  className="w-full flex items-center justify-center gap-3 bg-linear-to-r from-primary to-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                  Execute Broadcast
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Live Preview</label>
                <div className="p-6 rounded-3xl border border-dashed border-white/10 bg-white/2 flex flex-col items-center justify-center text-center gap-4 min-h-[180px]">
                  {broadcastMsg ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full"
                    >
                      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-left relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 bg-primary rounded-md"><Zap size={10} className="text-white" /></div>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Broadcast</span>
                        </div>
                        <p className="text-sm text-foreground/90 font-medium leading-relaxed">{broadcastMsg}</p>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full"></div>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="p-4 bg-white/5 rounded-full"><MessageSquare size={24} className="text-white/20" /></div>
                      <p className="text-xs text-foreground/20 font-bold uppercase tracking-widest">Awaiting Transmission Data...</p>
                    </>
                  )}
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                  <p className="text-[10px] text-amber-500/80 font-medium flex gap-2">
                    <AlertCircle size={12} />
                    NOTE: This will be delivered instantly to {activeUsers.length} active sessions via Socket.io layer.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Efficiency Table Redesign */}
        {!isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 rounded-[2.5rem] border border-white/5 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                  <Trophy size={20} className="text-amber-400" />
                  MEMBER PERFORMANCE MATRIX
                </h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Cross-reference productivity and task velocity</p>
              </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/2 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Operator</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 text-center">Todo</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 text-center">Active</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center text-emerald-400">Resolved</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Assigned Projects</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Efficiency Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-primary font-black text-lg border border-white/10 group-hover:border-primary/50 transition-colors">
                              {u.name?.charAt(0) || '?'}
                            </div>
                            {activeUsers.some(au => au.userId === u._id) && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#0a0a0c] rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{u.name}</p>
                            <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-center text-foreground/60">{u.todo}</td>
                      <td className="px-8 py-6 font-black text-center text-amber-500/80">{u.inProgress}</td>
                      <td className="px-8 py-6 font-black text-center text-emerald-400">{u.completed}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {u.projects && u.projects.length > 0 ? (
                            u.projects.map((p, idx) => (
                              <span key={idx} className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20 whitespace-nowrap">
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] font-black text-foreground/20 italic uppercase tracking-widest">No Projects</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((u.completed / (u.total || 1)) * 100)}%` }}
                              className="h-full bg-linear-to-r from-primary to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            />
                          </div>
                          <span className="text-xs font-black w-12 text-right text-primary">
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

        {/* Project Pulse Redesign */}
        {!isLoading && projectData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                <Zap size={24} className="text-purple-500" />
                STRATEGIC PROJECT PULSE
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projectData.map((project, i) => (
                <motion.div 
                  key={project._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                  className="glass-card p-6 rounded-4xl border border-white/5 space-y-5 hover:border-purple-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-all shadow-lg">
                      <Rocket size={18} />
                    </div>
                    <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-lg border ${
                      project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="font-black text-lg group-hover:text-purple-400 transition-colors tracking-tight line-clamp-1">{project.name}</h4>
                    <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest mt-1">{project.completedTasks} / {project.totalTasks} OBJECTIVES MET</p>
                  </div>

                  <div className="space-y-3 pt-2 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Efficiency</span>
                      <span className="text-xs font-black text-foreground">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        className="h-full bg-linear-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                      />
                    </div>
                  </div>
                  
                  {/* Background Accents */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full group-hover:bg-purple-500/10 transition-colors"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
