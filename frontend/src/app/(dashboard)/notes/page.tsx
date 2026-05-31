"use client";

import React, { useState, useEffect } from "react";
import { useNotes, useNoteDetail, useUpdateNote } from "@/hooks/useNotes";
import { NoteList } from "@/components/notes/NoteList";
import { MarkdownEditor } from "@/components/notes/MarkdownEditor";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { History, Loader2, Maximize2, Minimize2, FileText } from "lucide-react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");
  const [debouncedTitle] = useDebounce(localTitle, 1000);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const { data: notes, isLoading: isLoadingNotes } = useNotes(debouncedSearch);
  const { data: activeNote, isLoading: isLoadingDetail } = useNoteDetail(activeNoteId);
  const { data: projects } = useProjects();
  const updateNote = useUpdateNote();

  // Load content into local state when switching notes
  useEffect(() => {
    if (activeNote) {
      setLocalContent(activeNote.markdown_content || "");
      setLocalTitle(activeNote.title || "");
    } else {
      setLocalContent("");
      setLocalTitle("");
    }
  }, [activeNote?.id]);

  // Handle Title auto-save separately
  useEffect(() => {
    if (activeNote && debouncedTitle && debouncedTitle !== activeNote.title) {
      updateNote.mutate({ id: activeNote.id, data: { title: debouncedTitle } });
    }
  }, [debouncedTitle, activeNote?.id]);

  // Set default active note if none selected
  useEffect(() => {
    if (!activeNoteId && notes && notes.length > 0 && !debouncedSearch) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId, debouncedSearch]);

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0c] shadow-2xl">
      {/* Sidebar List */}
      <NoteList
        notes={notes}
        isLoading={isLoadingNotes}
        activeNoteId={activeNoteId}
        onSelectNote={(id) => id === -1 ? setActiveNoteId(null) : setActiveNoteId(id)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] relative">
        {activeNoteId ? (
          isLoadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : activeNote ? (
            <>
              {/* Workspace Topbar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/10">
                <div className="flex items-center gap-3 w-1/2">
                  <Input
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    className="bg-transparent border-none text-xl font-bold text-white px-0 focus-visible:ring-0 placeholder:text-white/20 min-w-[200px]"
                    placeholder="Note Title"
                  />
                  <select
                    value={activeNote.project_id || ""}
                    onChange={(e) => {
                      const newProjectId = e.target.value ? Number(e.target.value) : null;
                      updateNote.mutate({ id: activeNote.id, data: { project_id: newProjectId } });
                    }}
                    className="bg-white/5 border border-white/10 text-white/60 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary hover:text-white"
                  >
                    <option value="">No Project</option>
                    {projects?.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#121216]">{p.title}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors tooltip-trigger"
                    title="Toggle Preview Focus"
                  >
                    {isPreviewExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <History size={14} />
                    History ({activeNote.versions?.length || 0})
                  </button>
                </div>
              </div>

              {/* Editor & Preview Split Pane */}
              <div className="flex-1 flex overflow-hidden">
                {!isPreviewExpanded && (
                  <div className="w-1/2 border-r border-white/5 p-4">
                    <MarkdownEditor 
                      note={activeNote}
                      localContent={localContent}
                      onChange={setLocalContent}
                    />
                  </div>
                )}
                <div className={`p-8 overflow-y-auto custom-scrollbar ${isPreviewExpanded ? 'w-full' : 'w-1/2'} bg-[#0a0a0c]/50`}>
                  <MarkdownPreview content={localContent} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/30">
              Note not found.
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <FileText size={32} className="opacity-50" />
            </div>
            <p>Select a note or create a new one to start writing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
