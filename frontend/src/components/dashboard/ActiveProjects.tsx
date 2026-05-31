"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { ChevronRight, FolderGit2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function ActiveProjects() {
  const router = useRouter();
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="bg-[#121216] border border-white/5 rounded-2xl p-5 h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const activeProjects = projects?.filter(p => p.status === "active").slice(0, 3) || [];

  return (
    <div className="bg-[#121216] border border-white/5 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white tracking-tight">Active Projects</h3>
          <p className="text-xs text-white/40 mt-0.5">Your ongoing initiatives</p>
        </div>
        <button 
          onClick={() => router.push("/projects")}
          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {activeProjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm space-y-2">
            <FolderGit2 size={32} className="opacity-20" />
            <p>No active projects.</p>
          </div>
        ) : (
          activeProjects.map(project => (
            <div 
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{project.title}</p>
              </div>
              
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `70%` }} /* Mocked value since basic Project doesn't have completion % in list API currently */
                  className="h-full bg-primary/60 group-hover:bg-primary rounded-full transition-colors"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
