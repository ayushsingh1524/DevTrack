import axiosInstance from "@/lib/axios";
import { User } from "./auth.service";
import { Task } from "./task.service";

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  status: "active" | "completed" | "on_hold";
  deadline?: string;
  created_at: string;
  updated_at: string;
  owner?: User;
}

export interface ProjectAnalytics {
  total_tasks: int;
  completed_tasks: int;
  completion_percentage: int;
  overdue_tasks: int;
  pending_tasks: int;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
  analytics: ProjectAnalytics;
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
  status?: string;
  deadline?: string;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  status?: string;
  deadline?: string;
}

class ProjectService {
  async getProjects(skip = 0, limit = 100): Promise<Project[]> {
    const response = await axiosInstance.get("/projects", {
      params: { skip, limit },
    });
    return response.data;
  }

  async getProject(id: number): Promise<ProjectDetail> {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: CreateProjectDTO): Promise<Project> {
    const response = await axiosInstance.post("/projects", data);
    return response.data;
  }

  async updateProject(id: number, data: UpdateProjectDTO): Promise<Project> {
    const response = await axiosInstance.patch(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: number): Promise<Project> {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  }
}

export const projectService = new ProjectService();
