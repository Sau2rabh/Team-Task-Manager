"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { Plus, Folder, Users, ArrowRight, Loader2, Search, Filter, Calendar, Clock, BarChart3, AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface Project {
  _id: string;
  name: string;
  description: string;
  members: Array<{ user: { _id: string; name: string; email: string }; role: string }>;
  createdBy: { _id: string; name: string; email: string };
  status: 'Active' | 'Completed' | 'On Hold' | 'Archived';
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  dueDate?: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'Archived', value: 'Archived' },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'On Hold': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Archived': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-500';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-emerald-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Development': return <Zap size={24} />;
      case 'Design': return <BarChart3 size={24} />;
      case 'Marketing': return <TrendingUp size={24} />;
      case 'Planning': return <Clock size={24} />;
      default: return <Folder size={24} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Development': return 'bg-blue-500/10 text-blue-500';
      case 'Design': return 'bg-purple-500/10 text-purple-500';
      case 'Marketing': return 'bg-amber-500/10 text-amber-500';
      case 'Planning': return 'bg-rose-500/10 text-rose-500';
      default: return 'bg-indigo-500/10 text-indigo-500';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* ... header ... */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground mt-1">Manage and collaborate on your team projects.</p>
          </div>
          <Link 
            href="/projects/new"
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 w-full md:w-auto"
          >
            <Plus size={20} />
            New Project
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-secondary/30 p-4 rounded-2xl border border-border/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-[400px]">
            <Filter size={18} className="text-muted-foreground shrink-0" />
            <CustomSelect 
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <Folder className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-xl font-bold">No projects found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All' 
                ? "We couldn't find any projects matching your search criteria." 
                : "Create your first project to start organizing tasks and collaborating with your team."}
            </p>
            {!(searchQuery || statusFilter !== 'All') && (
              <Link 
                href="/projects/new"
                className="inline-block bg-white text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <Link 
                    href={`/projects/${project._id}`}
                    className="glass p-6 rounded-2xl hover:border-indigo-500/50 transition-all group relative overflow-hidden h-full flex flex-col"
                  >
                    {/* Status Badge */}
                    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${getStatusColor(project.status || 'Active')}`}>
                          {project.status || 'Active'}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${getCategoryColor(project.category || 'Other')}`}>
                          {project.category || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <AlertCircle size={12} className={getPriorityColor(project.priority || 'Medium')} />
                        <span className={getPriorityColor(project.priority || 'Medium')}>{project.priority || 'Medium'}</span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                        getCategoryColor(project.category || 'Other')
                      )}>
                        {getCategoryIcon(project.category || 'Other')}
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 grow">
                      {project.description || 'No description provided.'}
                    </p>
                    
                    {/* Progress Section */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <BarChart3 size={12} />
                          Progress
                        </span>
                        <span className="font-bold">{project.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress || 0}%` }}
                          className={`h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{project.completedTasks || 0} tasks done</span>
                        <span>{project.totalTasks || 0} total</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border/50 gap-3">
                      <div className="flex -space-x-2 shrink-0">
                        {project.members.slice(0, 3).map((m, idx) => (
                          <div 
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-background bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                            title={m.user?.name}
                          >
                            {m.user?.name?.charAt(0) || '?'}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground shadow-sm">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {project.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-500/5 px-2 py-1 rounded-md">
                            <Calendar size={12} />
                            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                          <Clock size={12} />
                          <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-secondary/50 px-2 py-1 rounded-md border border-border/50">
                          <Users size={12} />
                          <span>{project.members.length}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
