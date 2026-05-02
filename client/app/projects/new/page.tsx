"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { toast } from 'sonner';
import { FolderPlus, Loader2, ArrowLeft, Users, X, Check } from 'lucide-react';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setAvailableUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setMemberIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post('/projects', { 
        name, 
        description, 
        memberIds 
      });
      toast.success('Project created and members assigned!');
      router.push(`/projects/${data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8 py-4">
        <Link 
          href="/projects" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>

        <div>
          <h2 className="text-3xl font-bold">Create New Project</h2>
          <p className="text-muted-foreground mt-1">Set up a workspace for your team and tasks.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-8 border border-border/50">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Project Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Website Redesign"
                className="w-full bg-secondary border border-border rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description (Optional)</label>
              <textarea
                placeholder="What is this project about?"
                rows={3}
                className="w-full bg-secondary border border-border rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all resize-none font-medium"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Assign Members</label>
                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  {memberIds.length} Selected
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users to invite..."
                  className="w-full bg-secondary/50 border border-border rounded-2xl py-3 px-5 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all pl-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {isUsersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center py-4 text-sm text-muted-foreground italic">No users found</p>
                ) : (
                  filteredUsers.map(u => (
                    <div 
                      key={u._id}
                      onClick={() => toggleMember(u._id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                        memberIds.includes(u._id) 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-white/2 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border border-border">
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      {memberIds.includes(u._id) ? (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                          <Check size={12} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-border" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-100 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-white/5 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <FolderPlus size={22} />}
            Create Project & Assign Team
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
