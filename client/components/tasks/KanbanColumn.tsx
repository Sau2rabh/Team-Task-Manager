"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  assignedTo?: { _id: string; name: string; email: string };
  dueDate?: string;
  comments?: any[];
  activity?: any[];
}

interface Props {
  id: string;
  title: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: any) => void;
}

export const KanbanColumn: React.FC<Props> = ({ id, title, tasks, onTaskUpdate }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "kanban-column transition-colors",
        isOver && "bg-secondary/80"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {title}
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      <SortableContext 
        id={id}
        items={tasks.map(t => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3 min-h-[100px]">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onTaskUpdate={onTaskUpdate} />
          ))}
          {tasks.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-lg py-8 text-center text-muted-foreground text-sm">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
