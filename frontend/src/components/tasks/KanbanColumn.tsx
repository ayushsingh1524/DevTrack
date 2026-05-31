"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "@/services/task.service";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: { id: string; title: string };
  tasks: Task[];
  onTaskClick?: (taskId: number) => void;
}

export function KanbanColumn({ column, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-[#121216]/50 rounded-2xl border border-white/5 h-full overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#121216]/80">
        <h3 className="font-semibold text-sm text-white/90">{column.title}</h3>
        <div className="bg-white/10 text-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
          {tasks.length}
        </div>
      </div>
      
      <div 
        ref={setNodeRef} 
        className={cn(
          "flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors",
          isOver ? "bg-white/[0.02]" : ""
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 min-h-[100px]">
            {tasks.map(task => (
              <KanbanTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
