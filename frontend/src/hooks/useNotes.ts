import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService, CreateNoteDTO, UpdateNoteDTO, Note, NoteDetail } from "@/services/note.service";
import { toast } from "sonner";

export const useNotes = (search?: string, skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ["notes", { search, skip, limit }],
    queryFn: () => noteService.getNotes(search, skip, limit),
  });
};

export const useNoteDetail = (id: number | null) => {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => (id ? noteService.getNote(id) : Promise.reject("No ID")),
    enabled: !!id,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteDTO) => noteService.createNote(data),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // Optimistically push to detail cache
      queryClient.setQueryData(["note", newNote.id], { ...newNote, versions: [] });
      toast.success("Note created");
    },
    onError: () => {
      toast.error("Failed to create note");
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNoteDTO }) =>
      noteService.updateNote(id, data),
    onSuccess: (updatedNote) => {
      // Optimistically update list
      queryClient.setQueryData<Note[]>(["notes", { search: undefined, skip: 0, limit: 100 }], (old) => {
        if (!old) return old;
        return old.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      });
      // Invalidate detail to refetch new versions if needed
      queryClient.invalidateQueries({ queryKey: ["note", updatedNote.id] });
    },
    onError: () => {
      toast.error("Failed to save note");
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => noteService.deleteNote(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Note[]>(["notes", { search: undefined, skip: 0, limit: 100 }], (old) => {
        if (!old) return old;
        return old.filter((n) => n.id !== deletedId);
      });
      toast.success("Note deleted");
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });
};
