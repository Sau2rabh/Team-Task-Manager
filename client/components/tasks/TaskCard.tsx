"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlignLeft, CheckCircle2, Circle, Clock } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  assignedTo?: { _id: string; name: string; email: string };
  dueDate?: string;
}

interface Props {
  task: Task;
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

export const TaskCard: React.FC<Props> = ({ task, onTaskUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    if (onTaskUpdate) {
      onTaskUpdate(task._id, { status: newStatus });
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "task-card group relative",
        isDragging ? "opacity-30" : "opacity-100",
        task.status === 'Completed' && "border-l-4 border-l-green-500"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-foreground text-sm flex-1">{task.title}</h4>
        
        {/* Quick Status Toggle */}
        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'Todo' && (
            <button 
              onClick={(e) => handleStatusChange(e, 'Todo')}
              title="Move to Todo"
              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
            >
              <Circle size={14} />
            </button>
          )}
          {task.status !== 'In Progress' && (
            <button 
              onClick={(e) => handleStatusChange(e, 'In Progress')}
              title="Start Working"
              className="p-1 hover:bg-secondary rounded text-yellow-500/70 hover:text-yellow-500"
            >
              <Clock size={14} />
            </button>
          )}
          {task.status !== 'Completed' && (
            <button 
              onClick={(e) => handleStatusChange(e, 'Completed')}
              title="Complete Task"
              className="p-1 hover:bg-secondary rounded text-green-500/70 hover:text-green-500"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/10">
        <div className="flex items-center gap-2">
          {task.assignedTo && task.assignedTo.name && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold">
                {task.assignedTo.name.charAt(0)}
              </div>
              <span className="max-w-[80px] truncate">{task.assignedTo.name}</span>
            </div>
          )}
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar size={10} />
            <span className={cn(
              new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-400 font-bold' : ''
            )}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
