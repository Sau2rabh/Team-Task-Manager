"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { 
  Plus, 
  Sparkles, 
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { Timeline } from '@/components/projects/Timeline';
import { ProjectSettings } from '@/components/projects/ProjectSettings';
import { useAuth } from '@/context/AuthContext';

interface Project {
  _id: string;
  name: string;
  description: string;
  members: Array<{ user: { _id: string; name: string; email: string }; role: string }>;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  assignedTo?: { _id: string; name: string; email: string };
  dueDate?: string;
  createdAt: string;
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Board' | 'Timeline' | 'Members' | 'Settings'>('Board');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const { data } = await api.patch(`/projects/${id}/members`, { userId, role: newRole });
      setProject(data);
      setEditingMemberId(null);
      toast.success('Member role updated');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks/project/${id}`)
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error('Failed to fetch project data', error);
        toast.error('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectData();
  }, [id]);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, updates);
      setTasks(prev => prev.map(t => t._id === taskId ? data : t));
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const handleAiForge = async () => {
    if (!project) return;
    setIsAiLoading(true);
    try {
      const { data } = await api.post('/projects/ai-suggestions', {
        name: project.name,
        description: project.description
      });
      
      // Auto-create suggested tasks for demo purposes
      for (const suggestion of data) {
        await api.post('/tasks', {
          ...suggestion,
          projectId: id,
          status: 'Todo'
        });
      }
      
      // Refresh tasks
      const tasksRes = await api.get(`/tasks/project/${id}`);
      setTasks(tasksRes.data);
      toast.success('AI Task Forge successful! Suggestions added.');
    } catch (error) {
      toast.error('AI Forge failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTaskAdded = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={40} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">{project?.name}</h2>
              <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium border border-border">
                Active
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl">{project?.description}</p>
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAiForge}
                disabled={isAiLoading}
                className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                AI Task Forge
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-colors"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 border-b border-border pb-4">
          {(['Board', 'Timeline', 'Members', 'Settings'] as const)
            .filter(tab => !(tab === 'Settings' && !isAdmin))
            .map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-sm font-medium pb-4 px-1 transition-all relative",
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'Board' && (
            <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
          )}

          {activeTab === 'Timeline' && (
            <Timeline tasks={tasks} onTaskUpdate={handleTaskUpdate} />
          )}

          {activeTab === 'Members' && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {project?.members.map((member, i) => (
                      <tr key={i} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                              {member.user?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                              <p className="text-xs text-muted-foreground">{member.user?.email || 'No Email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingMemberId === member.user._id ? (
                            <select 
                              defaultValue={member.role}
                              onChange={(e) => handleRoleUpdate(member.user._id, e.target.value)}
                              className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Member">Member</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                          ) : (
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                              member.role === 'Admin' ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border"
                            )}>
                              {member.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isAdmin && member.user._id !== user?._id && (
                            <button 
                              onClick={() => setEditingMemberId(editingMemberId === member.user._id ? null : member.user._id)}
                              className="text-xs font-bold text-primary hover:underline transition-all"
                            >
                              {editingMemberId === member.user._id ? 'Cancel' : 'Edit Role'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Settings' && project && (
            <ProjectSettings 
              project={project} 
              isAdmin={isAdmin} 
              onUpdate={handleProjectUpdate} 
            />
          )}
        </div>

        <AddTaskModal 
          projectId={id as string}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onTaskAdded={handleTaskAdded}
          members={project?.members || []}
        />
      </div>
    </MainLayout>
  );
}
