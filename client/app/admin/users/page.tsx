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
  AlertTriangle,
  Check,
  ChevronDown,
  Filter,
  Power,
  UserCheck,
  UserPlus,
  UserX,
  RefreshCw
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
  isActive?: boolean;
  lastLogin?: string;
}

export default function UserManagementPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'member'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setIsProcessing(userId);
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
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

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return;

    try {
      setIsLoading(true);
      await api.post('/admin/users/bulk-delete', { userIds: selectedUsers });
      setUsers(users.filter(u => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk delete failed', error);
      alert('Bulk delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkRole = async (role: 'admin' | 'member') => {
    if (selectedUsers.length === 0) return;
    try {
      setIsLoading(true);
      await api.post('/admin/users/bulk-role', { userIds: selectedUsers, role });
      setUsers(users.map(u => selectedUsers.includes(u._id) ? { ...u, role } : u));
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk role update failed', error);
      alert('Bulk role update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uId => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' ? u.isActive !== false : u.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.isActive !== false).length,
    newThisMonth: users.filter(u => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(u.createdAt) > monthAgo;
    }).length
  };

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
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users size={32} />
              </div>
              User Management
            </h2>
            <p className="text-muted-foreground mt-1">Manage system access, roles, and account statuses.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUsers}
              className="p-2.5 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                showFilters ? "bg-primary text-white border-primary" : "bg-secondary/50 border-border text-foreground hover:bg-secondary"
              )}
            >
              <Filter size={18} />
              <span className="hidden md:inline">Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: 'indigo' },
            { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'amber' },
            { label: 'Active Now', value: stats.active, icon: UserCheck, color: 'emerald' },
            { label: 'New Members', value: stats.newThisMonth, icon: UserPlus, color: 'purple' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-3xl border border-border/50 flex flex-col gap-3"
            >
              <div className={cn("p-2 rounded-xl w-fit", `bg-${stat.color}-500/10 text-${stat.color}-500`)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 glass rounded-3xl border border-border/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Role Filter</label>
                  <div className="flex bg-secondary/50 p-1 rounded-xl border border-border">
                    {['all', 'admin', 'member'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setFilterRole(r as any)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-sm font-bold capitalize transition-all",
                          filterRole === r ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Status Filter</label>
                  <div className="flex bg-secondary/50 p-1 rounded-xl border border-border">
                    {['all', 'active', 'inactive'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s as any)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-sm font-bold capitalize transition-all",
                          filterStatus === s ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => {
                      setFilterRole('all');
                      setFilterStatus('all');
                      setSearchQuery('');
                    }}
                    className="w-full py-2.5 rounded-xl border border-border hover:bg-secondary transition-all text-sm font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="sticky top-4 z-40 flex items-center justify-between p-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {selectedUsers.length}
                </div>
                <p className="font-bold hidden md:block">Users Selected</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleBulkRole('admin')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-bold flex items-center gap-2"
                >
                  <ShieldCheck size={16} /> Make Admin
                </button>
                <button 
                  onClick={() => handleBulkRole('member')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-bold flex items-center gap-2"
                >
                  <Shield size={16} /> Make Member
                </button>
                <div className="w-px h-6 bg-white/20 mx-2" />
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 transition-all text-sm font-bold flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button 
                  onClick={() => setSelectedUsers([])}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <UserX size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground animate-pulse font-medium">Updating database records...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-3xl overflow-hidden border border-border/50"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white/5 border-b border-border/50">
                    <th className="px-6 py-4 w-12">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={toggleSelectAll}
                          className={cn(
                            "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                            selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                              ? "bg-primary border-primary text-white"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 && <Check size={14} strokeWidth={4} />}
                        </button>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
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
                        className={cn(
                          "group transition-colors",
                          selectedUsers.includes(u._id) ? "bg-primary/5" : "hover:bg-white/2"
                        )}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => toggleSelectUser(u._id)}
                              className={cn(
                                "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                                selectedUsers.includes(u._id)
                                  ? "bg-primary border-primary text-white"
                                  : "border-border group-hover:border-primary/50"
                              )}
                            >
                              {selectedUsers.includes(u._id) && <Check size={14} strokeWidth={4} />}
                            </button>
                          </div>
                        </td>
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
                          <button
                            onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                            disabled={isProcessing === u._id || u._id === currentUser?._id}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100",
                              u.isActive !== false 
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            )}
                          >
                            <Power size={12} />
                            {u.isActive !== false ? 'Active' : 'Suspended'}
                          </button>
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
                          <div className="flex items-center justify-end gap-2">
                            {u._id !== currentUser?._id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateRole(u._id, u.role === 'admin' ? 'member' : 'admin')}
                                  disabled={isProcessing === u._id}
                                  className={cn(
                                    "p-2.5 rounded-xl transition-all duration-300 hover:scale-110 border border-white/5 bg-white/5",
                                    u.role === 'admin' 
                                      ? "text-indigo-400 hover:bg-indigo-500/20" 
                                      : "text-amber-500 hover:bg-amber-500/20"
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
                                  className="p-2.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all duration-300 hover:scale-110 border border-white/5 bg-white/5"
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
                                You
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
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-500/80 font-medium">
            <span className="font-bold">Caution:</span> Role changes and account suspensions are effective immediately. Deleting a user will permanently remove their access and data.
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
