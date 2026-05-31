import axiosInstance from "@/lib/axios";

export interface NoteVersion {
  id: number;
  note_id: number;
  markdown_content: string;
  created_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  project_id?: number | null;
  title: string;
  markdown_content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteDetail extends Note {
  versions: NoteVersion[];
}

export interface CreateNoteDTO {
  title: string;
  markdown_content?: string;
  tags?: string[];
  project_id?: number | null;
}

export interface UpdateNoteDTO {
  title?: string;
  markdown_content?: string;
  tags?: string[];
  project_id?: number | null;
}

class NoteService {
  async getNotes(search?: string, project_id?: number, skip = 0, limit = 100): Promise<Note[]> {
    const response = await axiosInstance.get("/notes", {
      params: { search, project_id, skip, limit },
    });
    return response.data;
  }

  async getNote(id: number): Promise<NoteDetail> {
    const response = await axiosInstance.get(`/notes/${id}`);
    return response.data;
  }

  async createNote(data: CreateNoteDTO): Promise<Note> {
    const response = await axiosInstance.post("/notes", data);
    return response.data;
  }

  async updateNote(id: number, data: UpdateNoteDTO): Promise<Note> {
    const response = await axiosInstance.patch(`/notes/${id}`, data);
    return response.data;
  }

  async deleteNote(id: number): Promise<Note> {
    const response = await axiosInstance.delete(`/notes/${id}`);
    return response.data;
  }
}

export const noteService = new NoteService();
