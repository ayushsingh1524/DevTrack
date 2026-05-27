"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useUpdateNote } from "@/hooks/useNotes";
import { NoteDetail } from "@/services/note.service";
import { Loader2, Check } from "lucide-react";

interface MarkdownEditorProps {
  note: NoteDetail;
  onChange: (val: string) => void;
  localContent: string;
}

export function MarkdownEditor({ note, onChange, localContent }: MarkdownEditorProps) {
  const [debouncedContent] = useDebounce(localContent, 1500); // 1.5s debounce
  const updateNote = useUpdateNote();

  useEffect(() => {
    // Prevent saving if the debounced content matches the actual note content
    // or if the note is still loading/switching
    if (debouncedContent !== note.markdown_content) {
      updateNote.mutate({
        id: note.id,
        data: { markdown_content: debouncedContent }
      });
    }
  }, [debouncedContent, note.id, note.markdown_content]);

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] rounded-xl border border-white/5 overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
        <span className="text-xs font-semibold tracking-wider text-white/40 uppercase">Markdown Editor</span>
        <div className="flex items-center gap-2 text-xs">
          {updateNote.isPending ? (
            <span className="text-white/40 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Saving...</span>
          ) : updateNote.isSuccess ? (
            <span className="text-green-400 flex items-center gap-1.5"><Check size={12} /> Saved</span>
          ) : (
            <span className="text-white/20">All changes saved</span>
          )}
        </div>
      </div>
      <textarea
        value={localContent}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your markdown here..."
        className="flex-1 w-full resize-none bg-transparent p-4 text-sm text-white/80 focus:outline-none custom-scrollbar font-mono leading-relaxed"
        spellCheck="false"
      />
    </div>
  );
}
