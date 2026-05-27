"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/services/task.service";
import { useTaskStore } from "@/store/taskStore";
import { Clock, MessageSquare, Paperclip, AlertCircle, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const { setActiveTaskId } = useTaskStore();
  
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500/20 text-green-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "high":
        return "bg-orange-500/20 text-orange-400";
      case "urgent":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full h-[120px] rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative w-full rounded-xl border border-white/5 bg-[#1a1a20] p-4 shadow-sm hover:border-white/10 transition-colors flex flex-col gap-3 cursor-pointer"
      onClick={() => setActiveTaskId(task.id)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-2 p-1 text-white/0 group-hover:text-white/20 hover:!text-white/60 cursor-grab active:cursor-grabbing transition-colors"
      >
        <GripVertical size={16} />
      </div>

      <div className="flex flex-wrap gap-1.5 pr-6">
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", getPriorityColor(task.priority))}>
          {task.priority}
        </span>
        {task.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60">
            {tag}
          </span>
        ))}
        {task.tags && task.tags.length > 2 && (
          <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/40">
            +{task.tags.length - 2}
          </span>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white/90 line-clamp-2 leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-white/40 mt-1 line-clamp-1">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs text-white/40">
          {task.due_date && (
            <div className={cn("flex items-center gap-1", isOverdue ? "text-red-400" : "")}>
              <Clock size={12} />
              <span>
                {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 hover:text-white/70 transition-colors">
            <MessageSquare size={12} />
          </div>
        </div>
        
        <div>
          {task.assignee ? (
            <Avatar className="h-6 w-6 ring-1 ring-white/10">
              <AvatarImage src={task.assignee.avatar || ""} />
              <AvatarFallback className="bg-primary/20 text-primary text-[9px]">
                {task.assignee.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/20">
              <span className="text-[10px]">+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
