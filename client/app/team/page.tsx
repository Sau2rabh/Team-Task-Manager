"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { Mail, Shield, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await api.get('/projects/team');
        setTeam(data);
      } catch (error) {
        console.error('Failed to fetch team', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Team</h2>
          <p className="text-muted-foreground mt-1">People you collaborate with across all your projects.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={40} />
          </div>
        ) : team.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center space-y-4">
            <User className="mx-auto text-muted-foreground" size={48} />
            <h3 className="text-xl font-bold">Just you for now</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start adding members to your projects to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 rounded-2xl flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold border-4 border-secondary">
                  {member.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
                    <Mail size={14} />
                    <span className="text-sm">{member.email}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full text-xs font-medium border border-border">
                  <Shield size={12} className="text-indigo-400" />
                  {member.role}
                </div>

                <div className="w-full space-y-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-end">
                    <div className="text-left space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Efficiency</p>
                      <p className="text-2xl font-bold">{member.progress}%</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Tasks</p>
                      <p className="text-sm font-medium">{member.completedTasks} / {member.totalTasks}</p>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${member.progress}%` }}
                      className="h-full bg-linear-to-r from-indigo-500 to-purple-500"
                    />
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
