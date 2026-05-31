"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/services/task.service";
import { format } from "date-fns";
import { Clock, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface KanbanTaskCardProps {
  task: Task;
  onTaskClick?: (taskId: number) => void;
}

export function KanbanTaskCard({ task, onTaskClick }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col p-4 rounded-xl border bg-[#18181b] hover:border-white/20 transition-colors",
        isDragging ? "opacity-50 border-primary" : "border-white/10"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button 
            className="text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing -ml-1 p-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
          
          <span className={cn("px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border", getPriorityColor(task.priority))}>
            {task.priority}
          </span>
        </div>
      </div>

      <h4 
        onClick={() => onTaskClick && onTaskClick(task.id)}
        className="text-sm font-medium text-white/90 hover:text-primary transition-colors cursor-pointer line-clamp-2 mb-3"
      >
        {task.title}
      </h4>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/50">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center text-xs text-white/40 gap-3">
          {task.due_date && (
            <div className={cn("flex items-center gap-1", new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-400" : "")}>
              <Clock size={12} />
              <span>{format(new Date(task.due_date), "MMM d")}</span>
            </div>
          )}
        </div>

        <div>
          {task.assignee ? (
            <Avatar className="h-6 w-6 border border-[#18181b]">
              <AvatarImage src={task.assignee.avatar || ""} />
              <AvatarFallback className="bg-primary/20 text-[10px] text-primary">
                {task.assignee.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full border border-dashed border-white/20 flex items-center justify-center bg-white/5" title="Unassigned">
              <span className="text-[10px] text-white/30">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
