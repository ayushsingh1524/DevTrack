"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTask, useAssignees } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { X, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional().default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "review", "completed"]),
  due_date: z.string().optional().or(z.literal("")),
  tagsInput: z.string().optional().default(""),
  assignee_id: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export function CreateTaskModal() {
  const { isCreateModalOpen, setCreateModalOpen } = useTaskStore();
  const createTask = useCreateTask();
  const { data: assignees, isLoading: loadingAssignees } = useAssignees();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      priority: "medium",
      status: "todo",
      description: "",
      due_date: "",
      tagsInput: "",
      assignee_id: "",
    },
  });

  if (!isCreateModalOpen) return null;

  const onSubmit = async (values: CreateTaskFormValues) => {
    const tags = values.tagsInput
      ? values.tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const assigneeId = values.assignee_id ? parseInt(values.assignee_id, 10) : null;
    const dueDate = values.due_date ? new Date(values.due_date).toISOString() : null;

    try {
      await createTask.mutateAsync({
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        status: values.status,
        due_date: dueDate,
        tags,
        assignee_id: assigneeId,
      });
      reset();
      setCreateModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCreateModalOpen(false)}
          className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl z-10 theme-transition"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Create New Task</h2>
            <button
              onClick={() => setCreateModalOpen(false)}
              className="text-muted-foreground hover:text-foreground rounded-full p-1.5 hover:bg-accent transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-muted-foreground">Title</Label>
              <Input
                id="title"
                placeholder="Fix layout shift in navbar..."
                className="h-10"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-muted-foreground">Description</Label>
              <textarea
                id="description"
                placeholder="Provide a detailed description of the task..."
                rows={3}
                className="w-full rounded-lg border border-border bg-input p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                {...register("description")}
              />
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-muted-foreground">Status</Label>
                <select
                  id="status"
                  className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
                  {...register("status")}
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-muted-foreground">Priority</Label>
                <select
                  id="priority"
                  className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
                  {...register("priority")}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label htmlFor="assignee_id" className="text-muted-foreground">Assignee</Label>
                <select
                  id="assignee_id"
                  className="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
                  {...register("assignee_id")}
                >
                  <option value="">Unassigned</option>
                  {assignees?.map((user) => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-muted-foreground">Due Date</Label>
                <div className="relative">
                  <Input
                    id="due_date"
                    type="date"
                    className="h-10 pl-10"
                    {...register("due_date")}
                  />
                  <Calendar className="absolute left-3.5 top-3 text-muted-foreground" size={16} />
                </div>
              </div>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <Label htmlFor="tagsInput" className="text-muted-foreground">Tags (comma-separated)</Label>
              <Input
                id="tagsInput"
                placeholder="bug, frontend, ui"
                className="h-10"
                {...register("tagsInput")}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTask.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium min-w-[100px]"
              >
                {createTask.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Creating
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
