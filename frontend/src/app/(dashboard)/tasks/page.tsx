"use client";

import React, { useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { KanbanColumn } from "@/components/dashboard/KanbanColumn";
import { KanbanCard } from "@/components/dashboard/KanbanCard";
import { CreateTaskModal } from "@/components/dashboard/CreateTaskModal";
import { TaskDetailModal } from "@/components/dashboard/TaskDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Task } from "@/services/task.service";
import { useQueryClient } from "@tanstack/react-query";

const COLUMNS = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "completed", title: "Completed" },
];

export default function TasksPage() {
  const {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    isCreateModalOpen,
    setCreateModalOpen,
  } = useTaskStore();

  const { data: tasks, isLoading, isError } = useTasks({
    search: searchQuery || undefined,
    priority: priorityFilter || undefined,
  });

  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // minimum drag distance before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard Shortcuts (N = new task, / = search focus handled manually)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setCreateModalOpen(true);
      }
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("task-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCreateModalOpen]);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;
    if (task) {
      setActiveId(task.id);
      setActiveTask(task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // We optimistically modify cache to show items moving between lists
    queryClient.setQueryData<Task[]>(
      ["tasks", { search: searchQuery || undefined, priority: priorityFilter || undefined }],
      (oldTasks) => {
        if (!oldTasks) return oldTasks;
        
        const activeTaskIndex = oldTasks.findIndex((t) => t.id === activeId);
        
        if (isOverTask) {
          const overTaskIndex = oldTasks.findIndex((t) => t.id === overId);
          const activeTask = oldTasks[activeTaskIndex];
          const overTask = oldTasks[overTaskIndex];

          if (activeTask.status !== overTask.status) {
            const newTasks = [...oldTasks];
            newTasks[activeTaskIndex] = { ...activeTask, status: overTask.status };
            return arrayMove(newTasks, activeTaskIndex, overTaskIndex);
          }
          return arrayMove(oldTasks, activeTaskIndex, overTaskIndex);
        }

        if (isOverColumn) {
          const activeTask = oldTasks[activeTaskIndex];
          if (activeTask.status !== overId) {
            const newTasks = [...oldTasks];
            newTasks[activeTaskIndex] = { ...activeTask, status: overId as Task["status"] };
            return newTasks;
          }
        }

        return oldTasks;
      }
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";
    const targetStatus = isOverTask ? over.data.current?.task.status : isOverColumn ? overId : null;

    if (targetStatus && active.data.current?.task.status !== targetStatus) {
      // Fire actual API mutation for status change
      updateTask.mutate({
        id: activeId as number,
        data: { status: targetStatus as any },
      });
    }
  };

  const getTasksByColumn = (statusId: string) => {
    if (!tasks) return [];
    return tasks.filter((t) => t.status === statusId);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header & Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Tasks</h1>
          <p className="text-sm text-white/40 mt-1">Manage your project deliverables in a seamless Kanban workflow.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
            <Input
              id="task-search-input"
              placeholder="Search tasks (/ to focus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50 h-10 transition-all rounded-lg"
            />
          </div>
          
          <select
            value={priorityFilter || ""}
            onChange={(e) => setPriorityFilter(e.target.value || null)}
            className="h-10 rounded-lg border border-white/10 bg-[#121216] px-3 text-sm text-white/80 focus:border-primary/50 focus:outline-none transition-all cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] gap-2 font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Task (N)</span>
          </Button>
        </div>
      </motion.div>

      {/* Kanban Board Layout */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-red-400">
            Failed to load tasks.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-6 h-full items-start pb-4">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={getTasksByColumn(col.id)}
                />
              ))}
            </div>

            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
              }}
            >
              {activeId && activeTask ? <KanbanCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal />
      <TaskDetailModal />
    </div>
  );
}
