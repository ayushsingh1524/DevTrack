"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useNotes } from "@/hooks/useNotes";
import { ChevronRight, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function RecentNotes() {
  const router = useRouter();
  const { data: notes, isLoading } = useNotes();

  if (isLoading) {
    return (
      <div className="bg-[#121216] border border-white/5 rounded-2xl p-5 h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const recentNotes = notes?.slice(0, 4) || [];

  return (
    <div className="bg-[#121216] border border-white/5 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white tracking-tight">Recent Notes</h3>
          <p className="text-xs text-white/40 mt-0.5">Your latest documents</p>
        </div>
        <button
          onClick={() => router.push("/notes")}
          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {recentNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm space-y-2">
            <FileText size={32} className="opacity-20" />
            <p>No notes yet.</p>
          </div>
        ) : (
          recentNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push("/notes")}
              className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <FileText size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                  {note.title}
                </p>
                <p className="text-xs text-white/30 mt-1 line-clamp-1">
                  {note.markdown_content || "Empty note"}
                </p>
                <span className="text-[10px] text-white/20 mt-1 block">
                  {format(new Date(note.updated_at), "MMM d, h:mm a")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
