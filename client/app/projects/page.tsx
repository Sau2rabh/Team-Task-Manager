"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import { Plus, Folder, Users, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Project {
  _id: string;
  name: string;
  description: string;
  members: Array<{ user: { _id: string; name: string; email: string }; role: string }>;
  createdBy: { _id: string; name: string; email: string };
}

export default function ProjectsPage() {
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
            <h2 className="text-3xl font-bold">Projects</h2>
            <p className="text-muted-foreground mt-1">Manage and collaborate on your team projects.</p>
          </div>
          <Link 
            href="/projects/new"
            className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <Plus size={20} />
            New Project
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={40} />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-2xl p-20 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <Folder className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-xl font-bold">No projects yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Create your first project to start organizing tasks and collaborating with your team.
            </p>
            <Link 
              href="/projects/new"
              className="inline-block bg-white text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  href={`/projects/${project._id}`}
                  className="glass p-6 rounded-2xl block hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Folder size={24} />
                    </div>
                    <ArrowRight className="text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                    {project.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((m, idx) => (
                        <div 
                          key={idx}
                          className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold"
                          title={m.user?.name}
                        >
                          {m.user?.name?.charAt(0) || '?'}
                        </div>
                      ))}
                      {project.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users size={14} />
                      <span>{project.members.length} members</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
