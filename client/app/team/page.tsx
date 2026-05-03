"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { Mail, Shield, User, Users, Loader2, Search, ExternalLink, MessageSquare, MoreHorizontal, Activity, Circle, Copy, Check, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import MemberDetailModal from '@/components/team/MemberDetailModal';
import Leaderboard from '@/components/team/Leaderboard';
import { cn } from '@/lib/utils';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  status?: string;
  isOnline?: boolean;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'leaderboard'>('members');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await api.get('/projects/team');
        const enrichedData = data.map((m: TeamMember) => ({
          ...m,
          isOnline: Math.random() > 0.5
        }));
        setTeam(enrichedData);
      } catch (error) {
        console.error('Failed to fetch team', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-8">
        <MemberDetailModal 
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Team Hub</h2>
            <p className="text-muted-foreground mt-1">Collaborate, track performance, and climb the leaderboard.</p>
          </div>
          
          <div className="flex bg-secondary/50 p-1 rounded-2xl border border-border/50">
            <button 
              onClick={() => setActiveTab('members')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'members' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Members
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'leaderboard' ? "bg-amber-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Trophy size={14} />
              Leaderboard
            </button>
          </div>
        </div>

        {activeTab === 'members' ? (
          <>
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search team members..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center space-y-4">
            <User className="mx-auto text-muted-foreground" size={48} />
            <h3 className="text-xl font-bold">No members found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? "We couldn't find anyone matching your search." : "Start adding members to your projects to see them here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTeam.map((member, i) => (
                <motion.div
                  key={member._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="glass p-6 rounded-2xl flex flex-col items-center text-center space-y-4 relative group hover:border-indigo-500/30 transition-all duration-300"
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className={cn(
                      "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      member.status === 'Focus Mode' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                      member.status === 'In a Meeting' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                      member.status === 'Out of Office' ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      <Circle size={6} fill="currentColor" className={member.status === 'Available' ? 'animate-pulse' : ''} />
                      {member.status || 'Available'}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold border-4 border-background shadow-xl">
                      {member.name?.charAt(0) || '?'}
                    </div>
                    {member.isOnline && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-background rounded-full" />
                    )}
                  </div>

                  <div className="w-full overflow-hidden px-2">
                    <h3 className="text-lg font-bold truncate group-hover:text-indigo-400 transition-colors">{member.name}</h3>
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mt-0.5">
                      <Mail size={12} />
                      <span className="text-xs truncate max-w-[180px]">{member.email}</span>
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    member.role === 'Admin' 
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                    : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                  }`}>
                    <Shield size={12} />
                    {member.role}
                  </div>

                  {/* Performance Section */}
                  <div className="w-full space-y-3 pt-4 border-t border-border/50">
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                          <Activity size={10} />
                          Productivity
                        </p>
                        <p className="text-xl font-black text-white">{member.progress}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Tasks</p>
                        <p className="text-sm font-bold text-indigo-400">{member.completedTasks} / {member.totalTasks}</p>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${member.progress}%` }}
                        className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 w-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('open-direct-chat', { 
                        detail: { _id: member._id, name: member.name } 
                      }))}
                      className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={14} />
                      Chat
                    </button>
                    <button 
                      onClick={() => { setSelectedMember(member); setIsModalOpen(true); }}
                      className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-foreground"
                      title="View Details"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button 
                      onClick={() => handleCopyEmail(member.email, member._id)}
                      className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-foreground"
                      title="Copy Email"
                    >
                      {copiedId === member._id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </>
    ) : (
      <Leaderboard />
    )}
      </div>
    </MainLayout>
  );
}
