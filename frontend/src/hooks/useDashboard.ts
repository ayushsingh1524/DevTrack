import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardService.getOverview,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: dashboardService.getActivity,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
  });
}

// Helper hook to fetch all dashboard data in parallel
export function useDashboardData() {
  const overview = useDashboardOverview();
  const activity = useDashboardActivity();
  const stats = useDashboardStats();

  return {
    overview,
    activity,
    stats,
    isLoading: overview.isLoading || activity.isLoading || stats.isLoading,
    isError: overview.isError || activity.isError || stats.isError,
  };
}
