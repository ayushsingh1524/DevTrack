"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Note } from "@/services/note.service";
import { Search, Plus, FileText, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateNote, useDeleteNote } from "@/hooks/useNotes";

interface NoteListProps {
  notes?: Note[];
  isLoading: boolean;
  activeNoteId: number | null;
  onSelectNote: (id: number) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export function NoteList({ notes, isLoading, activeNoteId, onSelectNote, searchQuery, onSearchChange }: NoteListProps) {
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const handleCreate = () => {
    createNote.mutate({
      title: "Untitled Note",
      markdown_content: "# Untitled Note\n\nStart typing here..."
    }, {
      onSuccess: (newNote) => {
        onSelectNote(newNote.id);
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote.mutate(id);
      if (activeNoteId === id) {
        onSelectNote(-1); // Deselect
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121216] border-r border-white/5 w-72 flex-shrink-0">
      <div className="p-4 border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <FileText size={16} /> All Notes
          </h2>
          <Button 
            onClick={handleCreate} 
            disabled={createNote.isPending}
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
          >
            {createNote.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-white/30" size={14} />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-xs bg-[#0c0c0e] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-white/20" size={24} />
          </div>
        ) : !notes || notes.length === 0 ? (
          <div className="text-center text-white/30 text-xs py-8">
            No notes found.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`group flex flex-col p-3 rounded-lg cursor-pointer transition-all ${
                activeNoteId === note.id
                  ? "bg-primary/20 border border-primary/30"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className={`text-sm font-medium line-clamp-1 ${activeNoteId === note.id ? "text-primary" : "text-white/80"}`}>
                  {note.title || "Untitled Note"}
                </h3>
                <button 
                  onClick={(e) => handleDelete(e, note.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-0.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/40">
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
