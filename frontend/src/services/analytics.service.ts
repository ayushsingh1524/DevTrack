import axiosInstance from "@/lib/axios";

export interface AnalyticsOverview {
  total_completed_tasks: number;
  active_projects: number;
  current_streak_days: number;
  total_coding_hours: number;
}

export interface HeatmapDay {
  date: string;
  commits: number;
  hours: number;
  tasks_completed: number;
}

export interface StreakData {
  heatmap: HeatmapDay[];
}

export interface WeeklyChartData {
  day: string;
  hours: number;
  tasks: number;
}

export interface ProjectStat {
  name: string;
  progress: number;
  total_tasks: number;
}

export interface ProductivityData {
  weekly_chart: WeeklyChartData[];
  project_stats: ProjectStat[];
}

class AnalyticsService {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await axiosInstance.get("/analytics/overview");
    return response.data;
  }

  async getStreaks(): Promise<StreakData> {
    const response = await axiosInstance.get("/analytics/streaks");
    return response.data;
  }

  async getProductivity(): Promise<ProductivityData> {
    const response = await axiosInstance.get("/analytics/productivity");
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
