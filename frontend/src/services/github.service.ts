import axiosInstance from "@/lib/axios";

export interface GithubStatus {
  is_connected: boolean;
  username: string | null;
  last_synced: string | null;
}

export interface GithubStats {
  id: number;
  user_id: number;
  commits: number;
  repositories: number;
  pull_requests: number;
  top_languages: Record<string, number>;
  updated_at: string;
}

class GithubService {
  async getStatus(): Promise<GithubStatus> {
    const response = await axiosInstance.get("/github/status");
    return response.data;
  }

  async connect(): Promise<{ status: string; message: string }> {
    const response = await axiosInstance.post("/github/connect");
    return response.data;
  }

  async disconnect(): Promise<{ status: string }> {
    const response = await axiosInstance.post("/github/disconnect");
    return response.data;
  }

  async sync(): Promise<{ status: string }> {
    const response = await axiosInstance.post("/github/sync");
    return response.data;
  }

  async getStats(): Promise<GithubStats> {
    const response = await axiosInstance.get("/github/stats");
    return response.data;
  }
}

export const githubService = new GithubService();
