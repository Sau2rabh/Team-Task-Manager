"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  projectId: { _id: string; name: string };
  dueDate?: string;
}

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MyTasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const { data } = await api.get('/tasks/my');
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyTasks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'In Progress': return <Clock className="text-blue-500" size={18} />;
      default: return <AlertCircle className="text-muted-foreground" size={18} />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">My Tasks</h2>
          <p className="text-muted-foreground mt-1">All tasks assigned to you across all projects.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={40} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center space-y-4">
            <CheckCircle2 className="mx-auto text-muted-foreground" size={48} />
            <h3 className="text-xl font-bold">You're all caught up!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              No tasks assigned to you at the moment. Enjoy your free time!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{task.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Project: <span className="text-foreground font-medium">{task.projectId?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
                  {task.dueDate && (
                    <div className="text-left md:text-right">
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="text-sm font-medium">{formatDate(task.dueDate)}</p>
                    </div>
                  )}
                  <div className="px-3 py-1 bg-secondary rounded-full text-xs font-medium border border-border capitalize">
                    {task.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
