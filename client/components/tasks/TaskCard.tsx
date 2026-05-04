"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlignLeft, CheckCircle2, Circle, Clock, ChevronDown } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { Confetti } from '../ui/Confetti';
import { CustomSelect } from '../ui/CustomSelect';
import TaskDetailModal from './TaskDetailModal';

import { Task } from '@/types/task';


interface Props {
  task: Task;
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

export const TaskCard: React.FC<Props> = ({ task, onTaskUpdate }) => {
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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
      onClick={() => setIsModalOpen(true)}
      className={cn(
        "task-card group relative cursor-pointer active:scale-[0.98] transition-transform",
        isDragging ? "opacity-30" : "opacity-100",
        task.status === 'Completed' && "border-l-4 border-l-green-500"
      )}
    >
      <TaskDetailModal 
        taskId={task._id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => onTaskUpdate && onTaskUpdate(task._id, {})}
      />
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-foreground text-sm flex-1">{task.title}</h4>
        
        {/* Status Options Dropdown */}
        <div className="relative group/status flex items-center min-w-[100px]">
          {showConfetti && <Confetti />}
          <CustomSelect 
            size="sm"
            options={[
              { label: 'Todo', value: 'Todo' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' }
            ]}
            value={task.status}
            onChange={(newStatus) => {
              if (newStatus === 'Completed' && task.status !== 'Completed') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
              }
              onTaskUpdate && onTaskUpdate(task._id, { status: newStatus });
            }}
            className={cn(
              "w-full",
              task.status === 'Completed' ? "[&>button]:text-emerald-500 [&>button]:border-emerald-500/30" : 
              task.status === 'In Progress' ? "[&>button]:text-amber-500 [&>button]:border-amber-500/30" : 
              ""
            )}
          />
        </div>
      </div>
      
      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/10">
        <div className="flex items-center -space-x-2">
          {task.assignedTo && task.assignedTo.length > 0 ? (
            task.assignedTo.map((user, idx) => (
              <div 
                key={user._id} 
                title={user.name}
                className="w-6 h-6 rounded-full bg-linear-to-br from-primary to-indigo-600 border-2 border-background flex items-center justify-center text-[8px] font-black text-white shadow-sm ring-1 ring-white/10"
                style={{ zIndex: 10 - idx }}
              >
                {user.name.charAt(0)}
              </div>
            ))
          ) : (
            <div className="w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-muted-foreground">
              <User size={10} />
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
