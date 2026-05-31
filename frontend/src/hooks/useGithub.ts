import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { githubService } from "@/services/github.service";
import { toast } from "sonner";

export const useGithubStatus = () => {
  return useQuery({
    queryKey: ["github", "status"],
    queryFn: () => githubService.getStatus(),
  });
};

export const useGithubStats = (enabled: boolean) => {
  return useQuery({
    queryKey: ["github", "stats"],
    queryFn: () => githubService.getStats(),
    enabled,
    refetchInterval: (query) => {
      // If we have stats but commits is 0, it means sync is probably still running, poll every 2s
      if (query.state.data && query.state.data.commits === 0) {
        return 2000;
      }
      return false; // otherwise don't poll
    }
  });
};

export const useConnectGithub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => githubService.connect(token),
    onSuccess: () => {
      toast.success("Successfully connected to GitHub!");
      queryClient.invalidateQueries({ queryKey: ["github"] });
    },
    onError: () => {
      toast.error("Failed to connect to GitHub.");
    }
  });
};

export const useDisconnectGithub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => githubService.disconnect(),
    onSuccess: () => {
      toast.success("Disconnected from GitHub.");
      queryClient.invalidateQueries({ queryKey: ["github"] });
    },
    onError: () => {
      toast.error("Failed to disconnect from GitHub.");
    }
  });
};

export const useSyncGithub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => githubService.sync(),
    onSuccess: () => {
      toast.info("Background sync started...");
      // Reset the stats in cache so the polling logic kicks in (commits=0 temporarily)
      queryClient.setQueryData(["github", "stats"], (old: any) => ({ ...old, commits: 0 }));
      queryClient.invalidateQueries({ queryKey: ["github", "status"] });
    },
    onError: () => {
      toast.error("Failed to start sync.");
    }
  });
};
