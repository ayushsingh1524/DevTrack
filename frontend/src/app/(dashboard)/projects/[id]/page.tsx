"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectDetail, useDeleteProject } from "@/hooks/useProjects";
import { ProjectAnalytics } from "@/components/projects/ProjectAnalytics";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Edit3, Trash2, Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const { data: project, isLoading, isError } = useProjectDetail(projectId);
  const deleteProject = useDeleteProject();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project? Tasks will lose their project association.")) {
      deleteProject.mutate(projectId, {
        onSuccess: () => {
          router.push("/projects");
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="text-center text-red-400 mt-10">
        Project not found.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-white/10 text-white/60 border-white/10";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <button 
          onClick={() => router.push("/projects")}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">{project.title}</h1>
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-medium uppercase tracking-wider ${getStatusColor(project.status)}`}>
                {project.status.replace("_", " ")}
              </span>
            </div>
            {project.description && (
              <p className="text-white/60 mt-3 max-w-3xl leading-relaxed">{project.description}</p>
            )}
            
            <div className="flex items-center gap-6 mt-4 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>Created {format(new Date(project.created_at), "MMM d, yyyy")}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-2 text-primary/80">
                  <Calendar size={14} />
                  <span>Due {format(new Date(project.deadline), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
              <Edit3 size={16} /> Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2"
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="border-b border-white/5 pb-2">
        <h2 className="text-lg font-semibold text-white">Project Overview</h2>
      </div>

      {/* Analytics Dashboard */}
      <ProjectAnalytics analytics={project.analytics} />

      {/* Recent Tasks List */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Project Tasks</h2>
          <Button onClick={() => router.push("/tasks")} variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
            View in Kanban
          </Button>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#121216] overflow-hidden">
          {project.tasks.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              No tasks assigned to this project yet. Go to Tasks board to create some!
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {project.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <h4 className="text-sm font-medium text-white">{task.title}</h4>
                    <span className="text-xs text-white/40 capitalize">{task.status.replace("_", " ")}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    task.priority === 'high' || task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
