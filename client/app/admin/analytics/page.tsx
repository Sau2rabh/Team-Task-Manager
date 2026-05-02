"use client";

import React, { useEffect, useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UserAnalytics {
  _id: string;
  name: string;
  email: string;
  todo: number;
  inProgress: number;
  completed: number;
  total: number;
}

const COLORS = ['#818cf8', '#fbbf24', '#34d399'];

export default function AdminAnalyticsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<UserAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/analytics');
      setData(data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setIsLoading(false);
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

  return (
    <MainLayout>
      <div className="space-y-8 py-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="text-primary" size={32} />
              System Analytics
            </h2>
            <p className="text-muted-foreground mt-1">Real-time tracking of team productivity and task statuses.</p>
          </div>
          
          <button 
            onClick={fetchAnalytics}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/5"
          >
            <TrendingUp size={16} />
            Refresh Data
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground font-medium animate-pulse">Gathering real-time intelligence...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary Cards */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1 glass-card p-8 rounded-3xl space-y-6"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-indigo-400" />
                Global Status
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
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
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Users size={16}/></div>
                    <span className="text-sm font-medium">Total Members</span>
                  </div>
                  <span className="text-xl font-black">{data.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 size={16}/></div>
                    <span className="text-sm font-medium">Global Completion</span>
                  </div>
                  <span className="text-xl font-black">
                    {Math.round((aggregateData[2].value / (aggregateData[0].value + aggregateData[1].value + aggregateData[2].value || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Member Performance Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 glass-card p-8 rounded-3xl"
            >
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Member Productivity
              </h3>
              
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#1e1e2e', border: 'none', borderRadius: '12px' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    <Bar dataKey="todo" name="Todo" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} barSize={40} />
                    <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#34d399" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detailed List */}
        {!isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl overflow-hidden border border-border/50"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 border-b border-border/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Member</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Todo</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">In Progress</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.map((u) => (
                    <tr key={u._id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium">{u.todo}</td>
                      <td className="px-6 py-5 font-medium">{u.inProgress}</td>
                      <td className="px-6 py-5 font-medium text-emerald-400">{u.completed}</td>
                      <td className="px-6 py-5 font-bold">{u.total}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${Math.round((u.completed / (u.total || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold w-10">
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
      </div>
    </MainLayout>
  );
}
