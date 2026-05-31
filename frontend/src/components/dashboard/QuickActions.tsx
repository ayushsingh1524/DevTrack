"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTask } from "@/hooks/useTasks";
import { useCreateNote } from "@/hooks/useNotes";
import { Plus, FileText, ListChecks, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuickActions() {
  const router = useRouter();
  const createTask = useCreateTask();
  const createNote = useCreateNote();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    createTask.mutate(
      { title: taskTitle.trim(), priority: "medium", status: "todo" },
      {
        onSuccess: () => {
          setTaskTitle("");
          setShowTaskModal(false);
        },
      }
    );
  };

  const handleCreateNote = () => {
    if (!noteTitle.trim()) return;
    createNote.mutate(
      { title: noteTitle.trim() },
      {
        onSuccess: (newNote) => {
          setNoteTitle("");
          setShowNoteModal(false);
          router.push("/notes");
        },
      }
    );
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-medium group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          New Task
        </button>
        <button
          onClick={() => setShowNoteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-sm font-medium group"
        >
          <FileText size={16} className="group-hover:scale-110 transition-transform" />
          New Note
        </button>
      </div>

      {/* Quick Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks size={18} className="text-primary" />
                <h3 className="text-base font-bold text-white">Quick Task</h3>
              </div>
              <button onClick={() => setShowTaskModal(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <Input
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
              placeholder="What needs to be done?"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowTaskModal(false)} className="text-white/40 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={createTask.isPending || !taskTitle.trim()}>
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-purple-400" />
                <h3 className="text-base font-bold text-white">Quick Note</h3>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <Input
              autoFocus
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateNote()}
              placeholder="Give your note a title..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowNoteModal(false)} className="text-white/40 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleCreateNote} disabled={createNote.isPending || !noteTitle.trim()} className="bg-purple-600 hover:bg-purple-700">
                {createNote.isPending ? "Creating..." : "Create Note"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
