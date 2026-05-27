import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, Task, TaskComment, TaskActivity } from "@/services/task.service";
import { toast } from "sonner";

export function useTasks(filters?: {
  status?: string;
  priority?: string;
  search?: string;
  assignee_id?: number;
}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => taskService.getTasks(filters),
    placeholderData: (previousData) => previousData, // keep previous data while fetching
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Task>) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      taskService.updateTask(id, data),
    
    // Perform optimistic updates for drag-and-drop and inline edits
    onMutate: async ({ id, data }) => {
      // Cancel outstanding refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot previous tasks
      const previousTasksQueries = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });

      // Optimistically update all matching queries
      queryClient.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        return old.map((task) => (task.id === id ? { ...task, ...data } : task));
      });

      return { previousTasksQueries };
    },
    
    onError: (err, variables, context) => {
      // Rollback to previous state on failure
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
      toast.error("Failed to update task");
    },
    
    onSuccess: (updatedTask) => {
      // Update individual details query if active
      queryClient.setQueryData(["task", updatedTask.id], updatedTask);
    },
    
    onSettled: () => {
      // Invalidate both lists and detail queries to sync with db
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTasksQueries = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });

      // Optimistically remove from all cached lists
      queryClient.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        return old.filter((task) => task.id !== id);
      });

      return { previousTasksQueries };
    },
    onError: (err, id, context) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
      toast.error("Failed to delete task");
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: ["tasks", taskId, "comments"],
    queryFn: () => taskService.getComments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string }) => taskService.createComment(taskId, data),
    onSuccess: (newComment) => {
      // Instantly insert comment in cache
      queryClient.setQueryData<TaskComment[]>(
        ["tasks", taskId, "comments"],
        (old) => (old ? [...old, newComment] : [newComment])
      );
      // Invalidate activities as comments could affect them or list updates
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "activities"] });
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });
}

export function useTaskActivities(taskId: number) {
  return useQuery({
    queryKey: ["tasks", taskId, "activities"],
    queryFn: () => taskService.getActivities(taskId),
    enabled: !!taskId,
  });
}

export function useAssignees() {
  return useQuery({
    queryKey: ["users", "list"],
    queryFn: () => taskService.getAssignees(),
  });
}
