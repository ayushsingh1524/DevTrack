"use client";

import React, { useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Task } from "@/services/task.service";
import { KanbanCard } from "./KanbanCard";
import { useTaskStore } from "@/store/taskStore";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setCreateModalOpen } = useTaskStore();
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      columnId: id,
    },
  });

  const getHeaderColor = () => {
    switch (id) {
      case "todo":
        return "bg-slate-500/20 text-slate-500 dark:text-slate-400";
      case "in_progress":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "review":
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      case "completed":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[350px] bg-muted/30 border border-border rounded-2xl overflow-hidden shadow-sm h-full max-h-[calc(100vh-140px)] theme-transition">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${getHeaderColor().split(' ')[0]}`} />
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="flex items-center justify-center h-5 px-1.5 min-w-[20px] rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-accent transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Column Body / Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto overflow-x-hidden space-y-3 transition-colors ${
          isOver ? "bg-primary/5" : ""
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground italic select-none">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
