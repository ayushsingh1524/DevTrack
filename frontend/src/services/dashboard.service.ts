import { apiClient } from '@/lib/axios';

export const dashboardService = {
  async getOverview() {
    const response = await apiClient.get('/dashboard/overview');
    return response.data;
  },
  
  async getActivity() {
    const response = await apiClient.get('/dashboard/activity');
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }
};
