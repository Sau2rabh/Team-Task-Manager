"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Activity, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Send,
  User,
  Calendar,
  CheckCircle2,
  Trash2,
  Trophy
} from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Task, Comment, ActivityItem } from '@/types/task';


interface Props {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const TaskDetailModal: React.FC<Props> = ({ taskId, isOpen, onClose, onUpdate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity' | 'focus'>('comments');
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      toast.success("Focus session complete! Take a break.");
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const fetchTaskDetails = async () => {
    try {
      const response = await api.get(`/tasks/${taskId}`); 
      setTask(response.data);
    } catch (error) {
      console.error('Failed to fetch task details', error);
      // Fallback: If direct fetch fails, we might need to update the route
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { text: newComment });
      setTask(response.data);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background glass border border-white/10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
        >
          {/* Sidebar Info */}
          <div className="w-full md:w-1/3 bg-white/5 p-8 border-r border-white/5 flex flex-col">
            <div className="flex-1 space-y-8">
              <div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border mb-4 inline-block",
                  task?.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {task?.status || 'Loading...'}
                </span>
                <h2 className="text-2xl font-bold leading-tight">{task?.title}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned To</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task?.assignedTo && task.assignedTo.length > 0 ? (
                        task.assignedTo.map(u => (
                          <span key={u._id} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold border border-primary/20">
                            {u.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm font-bold">Unassigned</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</p>
                    <p className="text-sm font-bold">{task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {task?.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="mt-8 w-full py-4 bg-secondary hover:bg-secondary/80 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <X size={18} />
              Close Details
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs */}
            <div className="flex p-4 gap-2 border-b border-white/5">
              {[
                { id: 'comments', label: 'Discussion', icon: MessageSquare },
                { id: 'activity', label: 'History', icon: Activity },
                { id: 'focus', label: 'Focus Timer', icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all",
                    activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'comments' && (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 h-full flex flex-col"
                  >
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                      {task?.comments?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 italic">
                          <MessageSquare size={48} className="mb-4" />
                          <p>No comments yet. Start a discussion!</p>
                        </div>
                      ) : (
                        task?.comments?.map((comment) => (
                          <div key={comment._id} className="flex gap-4">
                            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {comment.user.name.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{comment.user.name}</span>
                                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                              </div>
                              <div className="p-3 bg-secondary/50 rounded-2xl rounded-tl-none border border-white/5">
                                <p className="text-sm">{comment.text}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-4 mt-auto">
                      <div className="relative">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full bg-secondary/30 border border-border focus:border-primary/50 rounded-2xl p-4 pr-12 text-sm outline-none resize-none h-20 transition-all"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={isSubmitting || !newComment.trim()}
                          className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {task?.activity?.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground opacity-30 italic">
                          <Activity size={48} className="mx-auto mb-4" />
                          <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                      task?.activity?.slice().reverse().map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-primary/10 shrink-0" />
                          <div>
                            <p className="text-sm">
                              <span className="font-bold text-foreground">{item.user.name}</span>
                              {" "}
                              <span className="text-muted-foreground">{item.action}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'focus' && (
                  <motion.div
                    key="focus"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col items-center justify-center space-y-12"
                  >
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <Clock size={40} className="text-primary animate-pulse" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Deep Focus Session</h3>
                      <div className="text-7xl font-black tracking-tighter tabular-nums">
                        {formatTime(timeLeft)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsActive(!isActive)}
                        className={cn(
                          "w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl active:scale-90",
                          isActive ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-primary text-white shadow-primary/20"
                        )}
                      >
                        {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </button>
                      <button
                        onClick={() => {
                          setIsActive(false);
                          setTimeLeft(25 * 60);
                        }}
                        className="w-16 h-16 bg-secondary text-foreground rounded-3xl flex items-center justify-center transition-all hover:bg-secondary/80 active:scale-90 shadow-xl shadow-black/5"
                      >
                        <RotateCcw size={24} />
                      </button>
                    </div>

                    <div className="max-w-xs text-center space-y-4">
                      <div className="flex items-center gap-2 justify-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full">
                        <Trophy size={14} />
                        Earn 25 XP on completion
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Studies show that 25 minutes of focused work followed by a 5 minute break maximizes productivity.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailModal;
