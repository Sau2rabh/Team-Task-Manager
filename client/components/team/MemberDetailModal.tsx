"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, Zap, Target, Award, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

interface Props {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

const MemberDetailModal: React.FC<Props> = ({ member, isOpen, onClose }) => {
  if (!member) return null;

  const stats = [
    { label: 'Total Tasks', value: member.totalTasks, icon: Target, color: 'text-indigo-500' },
    { label: 'Completed', value: member.completedTasks, icon: Award, color: 'text-emerald-500' },
    { label: 'Efficiency', value: `${member.progress}%`, icon: Zap, color: 'text-amber-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-background glass border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header / Cover */}
            <div className="h-32 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-4">
                {/* Avatar pulled up */}
                <div className="w-24 h-24 rounded-3xl bg-background p-1 shadow-2xl shrink-0 -mt-12">
                   <div className="w-full h-full rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-black text-white">
                    {member.name.charAt(0)}
                   </div>
                </div>
                
                {/* Stats quick overview or empty space to align on desktop */}
                <div className="hidden md:block flex-1" />
              </div>

              {/* Name and Basic Info (Always below the line) */}
              <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-1 text-foreground">{member.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <Mail size={14} className="text-primary" />
                    {member.email}
                  </span>
                  <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-border" />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border",
                    member.role === 'Admin' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-primary/10 text-primary border-primary/20"
                  )}>
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-secondary/30 border border-white/5 p-4 rounded-2xl">
                    <div className={cn("p-2 rounded-lg bg-white/5 w-fit mb-3", stat.color)}>
                      <stat.icon size={18} />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress Detail */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-primary" />
                    <h4 className="font-bold">Project Contribution</h4>
                  </div>
                  <span className="text-sm font-black text-primary">{member.progress}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${member.progress}%` }}
                    className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Incomplete</span>
                  <span>Goal Achieved</span>
                </div>
              </div>

              {/* Footer Quote */}
              <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
                <TrendingUp size={24} className="text-primary" />
                <p className="text-xs italic text-muted-foreground">
                  "{member.name} is currently performing above average in the current sprint cycle."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemberDetailModal;
