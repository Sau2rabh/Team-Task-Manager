"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Trophy, Medal, Crown, Star, Flame, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { socketService } from '@/lib/socket';

interface LeaderboardUser {
  _id: string;
  name: string;
  xp: number;
  level: number;
  profilePicture?: string;
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaders = async () => {
    try {
      const { data } = await api.get('/users/leaderboard');
      setLeaders(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
    
    // Refresh leaderboard when any user levels up or gets XP
    socketService.on('leaderboard_refresh', fetchLeaders);
    
    return () => {
      socketService.off('leaderboard_refresh');
    };
  }, []);

  if (isLoading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const topThree = leaders.slice(0, 3);
  const others = leaders.slice(3);

  return (
    <div className="space-y-12 py-8">
      {/* Podium for Top 3 */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-8 px-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center group order-2 md:order-1"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-slate-300 flex items-center justify-center p-1 border-4 border-slate-200">
                <div className="w-full h-full rounded-full bg-linear-to-br from-slate-400 to-slate-500 flex items-center justify-center text-2xl font-black text-white">
                  {topThree[1].name.charAt(0)}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 border-4 border-background flex items-center justify-center text-white font-bold text-xs">
                2
              </div>
            </div>
            <p className="font-bold text-slate-400">{topThree[1].name}</p>
            <div className="bg-slate-500/10 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 border border-slate-500/20">
              Lv.{topThree[1].level}
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center group order-1 md:order-2"
          >
            <div className="relative mb-6">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Crown className="text-amber-400 fill-amber-400" size={40} />
                </motion.div>
              </div>
              <div className="w-28 h-28 rounded-full bg-amber-400 flex items-center justify-center p-1.5 border-4 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                <div className="w-full h-full rounded-full bg-linear-to-br from-amber-500 via-yellow-500 to-orange-500 flex items-center justify-center text-4xl font-black text-white">
                  {topThree[0].name.charAt(0)}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-500 border-4 border-background flex items-center justify-center text-white font-bold">
                1
              </div>
            </div>
            <p className="text-xl font-black text-amber-500">{topThree[0].name}</p>
            <div className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mt-2 border border-amber-500/20 flex items-center gap-2">
              <Star size={12} fill="currentColor" />
              Lv.{topThree[0].level}
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center group order-3"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-amber-700/50 flex items-center justify-center p-1 border-4 border-amber-700/30">
                <div className="w-full h-full rounded-full bg-linear-to-br from-amber-700 to-amber-900 flex items-center justify-center text-2xl font-black text-white">
                  {topThree[2].name.charAt(0)}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-800 border-4 border-background flex items-center justify-center text-white font-bold text-xs">
                3
              </div>
            </div>
            <p className="font-bold text-amber-800">{topThree[2].name}</p>
            <div className="bg-amber-800/10 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 border border-amber-800/20">
              Lv.{topThree[2].level}
            </div>
          </motion.div>
        )}
      </div>

      {/* List for Others */}
      <div className="max-w-3xl mx-auto space-y-3">
        {others.map((leader, idx) => (
          <motion.div
            key={leader._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-black text-muted-foreground group-hover:text-primary transition-colors">
                {idx + 4}
              </span>
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold">
                {leader.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm">{leader.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Member</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-black text-primary">Lv. {leader.level}</p>
                <div className="h-1 w-20 bg-secondary rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(leader.xp % 500) / 5}%` }} 
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg border border-amber-500/20">
                <Flame size={12} className="fill-amber-500" />
                <span className="text-xs font-black">{leader.xp} XP</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
