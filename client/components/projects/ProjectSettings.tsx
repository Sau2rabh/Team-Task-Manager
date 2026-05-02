"use client";

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { 
  Settings2, 
  Trash2, 
  Save, 
  Moon, 
  Sun, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Project {
  _id: string;
  name: string;
  description: string;
  members: Array<{ user: { _id: string; name: string; email: string }; role: string }>;
}

interface ProjectSettingsProps {
  project: Project;
  isAdmin: boolean;
  onUpdate: (updatedProject: Project) => void;
}

export function ProjectSettings({ project, isAdmin, onUpdate }: ProjectSettingsProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setIsUpdating(true);
    try {
      const { data } = await api.put(`/projects/${project._id}`, { name, description });
      onUpdate(data);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/projects/${project._id}`);
      toast.success('Project deleted');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Project Details (Admin Only) */}
      {isAdmin ? (
        <section className="glass p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Project Details</h3>
              <p className="text-sm text-muted-foreground">Update project name and information.</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Project Name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]"
                placeholder="What is this project about?"
              />
            </div>
            <button 
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </section>
      ) : (
        <div className="glass p-8 rounded-2xl text-center">
          <p className="text-muted-foreground">Only project admins can change project settings.</p>
        </div>
      )}

      {/* Danger Zone (Admin Only) */}
      {isAdmin && (
        <section className="glass border-destructive/20 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">Permanent actions that cannot be undone.</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/10">
              <div>
                <p className="font-semibold text-destructive">Delete this project</p>
                <p className="text-xs text-muted-foreground">Once you delete a project, there is no going back. Please be certain.</p>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-lg hover:bg-destructive hover:text-white transition-all font-medium"
              >
                Delete Project
              </button>
            </div>
          ) : (
            <div className="p-6 bg-destructive/10 rounded-xl border border-destructive/20 space-y-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle size={24} />
                <p className="font-bold">Are you absolutely sure?</p>
              </div>
              <p className="text-sm">This action will permanently delete the project **{project.name}** and all its associated tasks. This cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all font-bold flex items-center gap-2"
                >
                  {isDeleting && <Loader2 className="animate-spin" size={18} />}
                  Yes, Delete Project
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-secondary text-foreground px-6 py-2 rounded-lg hover:bg-secondary/80 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
