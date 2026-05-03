"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  _id: string;
  name: string;
  description: string;
}

export default function AiRoadmapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">AI Generated Roadmap</h2>
              <div className="bg-linear-to-r from-indigo-500 to-purple-500 p-1 rounded-full">
                <div className="bg-background rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Sparkles size={10} className="text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Powered</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mt-1">Smart milestones and projections generated for your active projects.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={40} />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center space-y-4">
            <Zap className="mx-auto text-muted-foreground" size={48} />
            <h3 className="text-xl font-bold">No active projects</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Create a project first so Team Task Manager can generate a roadmap for you.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-secondary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="text-2xl font-bold">{project.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {/* Timeline line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10 hidden md:block" />
                  
                  {[
                    { title: "Phase 1: Foundation", date: "Month 1", status: "completed", desc: "Setting up core infrastructure and team roles." },
                    { title: "Phase 2: Development", date: "Month 2-3", status: "in-progress", desc: "Executing primary project tasks and milestones." },
                    { title: "Phase 3: Launch", date: "Month 4", status: "pending", desc: "Final quality checks and public release." },
                  ].map((phase, idx) => (
                    <div key={idx} className="glass p-6 rounded-2xl border-t-4 border-indigo-500/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{phase.date}</span>
                        {phase.status === 'completed' && <CheckCircle2 className="text-green-500" size={16} />}
                        {phase.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                      </div>
                      <h4 className="font-bold mb-2">{phase.title}</h4>
                      <p className="text-sm text-muted-foreground">{phase.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
