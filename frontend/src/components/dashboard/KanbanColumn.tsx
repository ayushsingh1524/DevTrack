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
        return "bg-slate-500/20 text-slate-400";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400";
      case "review":
        return "bg-yellow-500/20 text-yellow-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[350px] bg-[#0c0c0e]/50 border border-white/5 rounded-2xl overflow-hidden shadow-lg h-full max-h-[calc(100vh-140px)]">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${getHeaderColor().split(' ')[0]}`} />
          <h3 className="font-semibold text-white/90">{title}</h3>
          <span className="flex items-center justify-center h-5 px-1.5 min-w-[20px] rounded-full bg-white/10 text-[10px] font-bold text-white/60">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="text-white/40 hover:text-white rounded-md p-1 hover:bg-white/10 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Column Body / Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto overflow-x-hidden space-y-3 custom-scrollbar transition-colors ${
          isOver ? "bg-white/[0.02]" : ""
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-white/20 italic select-none">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
