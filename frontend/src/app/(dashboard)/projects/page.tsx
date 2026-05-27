"use client";

import React, { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: projects, isLoading, isError } = useProjects();

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Projects</h1>
          <p className="text-sm text-white/40 mt-1">Manage all your team initiatives and their progress.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white focus:border-primary/50 h-10 transition-all rounded-lg"
            />
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] gap-2 font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Project</span>
          </Button>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : isError ? (
          <div className="text-center text-red-400 mt-10">
            Failed to load projects. Please try again.
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <p className="text-white/40 mb-4">No projects found.</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)} className="border-white/10 text-white hover:bg-white/5">
              Create your first project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
