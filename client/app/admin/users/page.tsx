"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { 
  Users, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  Search, 
  Loader2,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export default function UserManagementPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setIsProcessing(userId);
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
    } catch (error) {
      console.error('Failed to update role', error);
      alert('Failed to update role');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsProcessing(userId);
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Failed to delete user', error);
      alert('Failed to delete user');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || (currentUser && currentUser.role !== 'admin')) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

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
              <Users className="text-primary" size={32} />
              User Management
            </h2>
            <p className="text-muted-foreground mt-1">Manage system access and user permissions.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground animate-pulse font-medium">Loading user database...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-3xl overflow-hidden border border-border/50"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 border-b border-border/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Joined At</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <AnimatePresence mode='popLayout'>
                    {filteredUsers.map((u) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={u._id} 
                        className="group hover:bg-white/2 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/10">
                              {u.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail size={12} />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {u.role === 'admin' ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-tighter">
                                <ShieldCheck size={12} />
                                Admin
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-tighter">
                                <Shield size={12} />
                                Member
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(u.createdAt).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            {u._id !== currentUser?._id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateRole(u._id, u.role === 'admin' ? 'member' : 'admin')}
                                  disabled={isProcessing === u._id}
                                  className={cn(
                                    "p-2.5 rounded-xl transition-all duration-300 hover:scale-110 border border-white/5 bg-white/5",
                                    u.role === 'admin' 
                                      ? "text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/30" 
                                      : "text-amber-500 hover:bg-amber-500/20 hover:border-amber-500/30"
                                  )}
                                  title={u.role === 'admin' ? "Demote to Member" : "Promote to Admin"}
                                >
                                  {isProcessing === u._id ? (
                                    <Loader2 className="animate-spin" size={18} />
                                  ) : u.role === 'admin' ? (
                                    <Shield size={18} />
                                  ) : (
                                    <ShieldCheck size={18} />
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete({ id: u._id, name: u.name })}
                                  disabled={isProcessing === u._id}
                                  className="p-2.5 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 rounded-xl transition-all duration-300 hover:scale-110 border border-white/5 bg-white/5"
                                  title="Delete User"
                                >
                                  {isProcessing === u._id ? (
                                    <Loader2 className="animate-spin" size={18} />
                                  ) : (
                                    <Trash2 size={18} />
                                  )}
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 border border-white/5">
                                Current User
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Search className="text-muted-foreground" size={32} />
                  </div>
                  <h3 className="text-xl font-bold">No users found</h3>
                  <p className="text-muted-foreground mt-1 max-w-xs">
                    We couldn't find any users matching your search criteria.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-500/80 font-medium">
            <span className="font-bold">Caution:</span> Role changes and deletions are permanent. Be careful when managing user access to sensitive project data.
          </p>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-8 rounded-[2.5rem] shadow-2xl border border-white/10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Confirm Deletion</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Are you sure you want to delete <span className="text-foreground font-bold underline decoration-rose-500/30 decoration-2 underline-offset-4">{confirmDelete.name}</span>? This action cannot be undone.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-6 py-3 rounded-2xl bg-secondary text-foreground font-bold hover:bg-white/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(confirmDelete.id)}
                    className="px-6 py-3 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
