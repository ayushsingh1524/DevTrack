"use client";

import React from "react";
import { format } from "date-fns";
import { Clock, MessageSquare, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task } from "@/services/task.service";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (taskId: number) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
        <p className="text-white/40 mb-2">No tasks available in this view.</p>
      </div>
    );
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "in_progress":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "review":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-white/60 bg-white/10 border-white/10";
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
        <div className="col-span-5 sm:col-span-6">Title</div>
        <div className="col-span-3 sm:col-span-2 text-center">Status</div>
        <div className="col-span-4 sm:col-span-2 text-center">Priority</div>
        <div className="hidden sm:block sm:col-span-2 text-right">Assignee</div>
      </div>
      
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onTaskClick && onTaskClick(task.id)}
          className="grid grid-cols-12 gap-4 px-4 py-4 items-center bg-[#121216] border border-white/5 rounded-xl hover:bg-white/[0.02] hover:border-white/10 transition-colors cursor-pointer group"
        >
          {/* Title and tags */}
          <div className="col-span-5 sm:col-span-6 flex flex-col items-start gap-1">
            <span className="text-sm font-medium text-white/90 group-hover:text-primary transition-colors line-clamp-1">
              {task.title}
            </span>
            <div className="flex items-center gap-2 text-xs text-white/40">
              {task.due_date && (
                <span className={cn("flex items-center gap-1", new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-400" : "")}>
                  <Clock size={12} />
                  {format(new Date(task.due_date), "MMM d")}
                </span>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {task.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded-sm bg-white/5 text-[10px] text-white/50">
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && <span className="text-[10px] text-white/30">+{task.tags.length - 2}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="col-span-3 sm:col-span-2 flex justify-center">
            <span className={cn("px-2 py-1 rounded-full border text-[10px] uppercase font-semibold tracking-wide", getStatusColor(task.status))}>
              {task.status.replace("_", " ")}
            </span>
          </div>

          {/* Priority */}
          <div className="col-span-4 sm:col-span-2 flex justify-center">
            <span className={cn("px-2 py-1 rounded-md border text-[10px] uppercase font-medium", getPriorityColor(task.priority))}>
              {task.priority}
            </span>
          </div>

          {/* Assignee */}
          <div className="hidden sm:flex sm:col-span-2 justify-end">
            {task.assignee ? (
              <Avatar className="h-6 w-6 border border-white/10">
                <AvatarImage src={task.assignee.avatar || ""} />
                <AvatarFallback className="bg-primary/20 text-[10px] text-primary">
                  {task.assignee.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-xs text-white/20 italic">Unassigned</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
