"use client";

import React, { useState } from 'react';
import { CustomSelect } from '../ui/CustomSelect';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: (task: any) => void;
  members: any[];
}

export const AddTaskModal: React.FC<Props> = ({ projectId, isOpen, onClose, onTaskAdded, members }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [status, setStatus] = useState('Todo');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberOptions = members.map(m => ({ value: m.user._id, label: m.user.name }));

  const statusOptions = [
    { value: 'Todo', label: 'Todo' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' }
  ];

  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/tasks', {
        title,
        description,
        projectId,
        assignedTo: assignedTo.length > 0 ? assignedTo : [],
        status,
        dueDate: dueDate || undefined
      });
      onTaskAdded(data);
      toast.success('Task added successfully');
      setTitle('');
      setDescription('');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass w-full max-w-lg rounded-[2.5rem] border border-white/20 shadow-2xl animate-in zoom-in duration-300 relative overflow-visible">
        <div className="flex items-center justify-between p-8 border-b border-border bg-secondary/30">
          <h3 className="text-2xl font-bold tracking-tight">Add New Task</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-visible">
          <div className="space-y-2">
            <label className="block text-sm font-bold ml-1 text-muted-foreground uppercase tracking-widest">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-3.5 focus:outline-hidden focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/30"
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold ml-1 text-muted-foreground uppercase tracking-widest">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-3.5 focus:outline-hidden focus:ring-2 focus:ring-primary/50 transition-all h-28 resize-none text-foreground placeholder:text-muted-foreground/30"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold ml-1 text-muted-foreground uppercase tracking-widest">Assign To</label>
              <CustomSelect
                value={assignedTo}
                onChange={setAssignedTo}
                options={memberOptions}
                placeholder="Select Members"
                multiple={true}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold ml-1 text-muted-foreground uppercase tracking-widest">Status</label>
              <CustomSelect
                value={status}
                onChange={setStatus}
                options={statusOptions}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold ml-1 text-muted-foreground uppercase tracking-widest">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ colorScheme: theme }}
              className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-3.5 focus:outline-hidden focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-border font-bold hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={20} />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
