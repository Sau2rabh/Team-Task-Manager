"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { Task } from '@/types/task';


interface TimelineProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

export function Timeline({ tasks, onTaskUpdate }: TimelineProps) {
  // Sort tasks by creation date (descending)
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (tasks.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-muted-foreground">No activity yet. Create a task to see it here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
      {sortedTasks.map((task, index) => (
        <motion.div 
          key={task._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {task.status === 'Completed' ? (
              <CheckCircle2 className="text-green-500" size={20} />
            ) : task.status === 'In Progress' ? (
              <Clock className="text-yellow-500" size={20} />
            ) : (
              <Circle className="text-muted-foreground" size={20} />
            )}
          </div>

          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[45%] glass p-6 rounded-2xl shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <time className="text-xs font-semibold text-primary uppercase tracking-wider">
                {format(new Date(task.createdAt), 'MMM dd, yyyy')}
              </time>
              <div className="flex gap-1">
                {(['Todo', 'In Progress', 'Completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onTaskUpdate?.(task._id, { status: s })}
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase transition-all",
                      task.status === s 
                        ? s === 'Completed' ? 'bg-green-500 text-white' :
                          s === 'In Progress' ? 'bg-yellow-500 text-black' :
                          'bg-primary text-white'
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{task.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            
            {task.dueDate && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg w-fit">
                <Calendar size={14} />
                <span>Due: {format(new Date(task.dueDate), 'PPP')}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
