import { apiClient } from "@/lib/axios";

export interface Task {
  id: number;
  project_id: number | null;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "completed";
  due_date: string | null;
  tags: string[];
  owner_id: number;
  assignee_id: number | null;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
  };
  assignee: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
  } | null;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export interface TaskActivity {
  id: number;
  task_id: number;
  user_id: number;
  activity_type: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export const taskService = {
  async getTasks(params?: {
    status?: string;
    priority?: string;
    search?: string;
    assignee_id?: number;
    skip?: number;
    limit?: number;
  }): Promise<Task[]> {
    const response = await apiClient.get("/tasks", { params });
    return response.data;
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await apiClient.post("/tasks", data);
    return response.data;
  },

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async getComments(taskId: number): Promise<TaskComment[]> {
    const response = await apiClient.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  async createComment(taskId: number, data: { content: string }): Promise<TaskComment> {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  },

  async getActivities(taskId: number): Promise<TaskActivity[]> {
    const response = await apiClient.get(`/tasks/${taskId}/activities`);
    return response.data;
  },

  async getAssignees(): Promise<any[]> {
    const response = await apiClient.get("/tasks/users/list");
    return response.data;
  },
};
