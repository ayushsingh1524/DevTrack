import { create } from "zustand";

interface TaskState {
  searchQuery: string;
  priorityFilter: string | null;
  tagFilter: string | null;
  activeTaskId: number | null;
  isCreateModalOpen: boolean;
  
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: string | null) => void;
  setTagFilter: (tag: string | null) => void;
  setActiveTaskId: (id: number | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  resetFilters: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  searchQuery: "",
  priorityFilter: null,
  tagFilter: null,
  activeTaskId: null,
  isCreateModalOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setTagFilter: (tag) => set({ tagFilter: tag }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  resetFilters: () => set({ searchQuery: "", priorityFilter: null, tagFilter: null }),
}));
