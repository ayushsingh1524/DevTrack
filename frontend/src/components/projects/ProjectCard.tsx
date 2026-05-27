"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, MoreVertical, LayoutGrid } from "lucide-react";
import { Project } from "@/services/project.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
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

  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== "completed";

  return (
    <Link href={`/projects/${project.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col h-[220px] rounded-2xl border border-white/5 bg-[#121216] p-5 transition-all hover:border-white/10 hover:bg-[#16161a] hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className={cn("px-2.5 py-1 rounded-full border text-[10px] font-medium uppercase tracking-wider", getStatusColor(project.status))}>
            {project.status.replace("_", " ")}
          </div>
          <button className="text-white/20 hover:text-white/60 transition-colors p-1" onClick={(e) => e.preventDefault()}>
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1">
          <h3 className="text-lg font-semibold text-white/90 line-clamp-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-white/40 line-clamp-2">
            {project.description || "No description provided."}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Owner Avatar */}
            {project.owner && (
              <Avatar className="h-7 w-7 ring-2 ring-[#121216]">
                <AvatarImage src={project.owner.avatar || ""} />
                <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                  {project.owner.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-white/40">
            {project.deadline && (
              <div className={cn("flex items-center gap-1.5", isOverdue ? "text-red-400" : "")}>
                <Clock size={12} />
                <span>{format(new Date(project.deadline), "MMM d")}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
