"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

import { useCreateProject } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "completed", "on_hold"]).default("active"),
  deadline: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      status: "active",
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    createProject.mutate(
      {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Create Project</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Title</label>
                  <Input
                    {...register("title")}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50"
                    placeholder="E.g., Q3 Marketing Campaign"
                  />
                  {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Description</label>
                  <textarea
                    {...register("description")}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px]"
                    placeholder="Brief overview of the project..."
                  />
                  {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80">Status</label>
                    <select
                      {...register("status")}
                      className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-primary/50 focus:outline-none"
                    >
                      <option value="active" className="bg-[#121216]">Active</option>
                      <option value="on_hold" className="bg-[#121216]">On Hold</option>
                      <option value="completed" className="bg-[#121216]">Completed</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80">Deadline</label>
                    <Input
                      type="date"
                      {...register("deadline")}
                      className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-white/60 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProject.isPending}
                    className="bg-primary hover:bg-primary/80 text-white min-w-[100px]"
                  >
                    {createProject.isPending ? <Loader2 className="animate-spin" size={16} /> : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
