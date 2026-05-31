"use client";

import React, { useState } from "react";
import { GitBranch, GitCommit, Link2, ExternalLink, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ProjectGithubActivityProps {
  repos: any[];
  activities: any[];
  onAddRepo?: (repoFullName: string) => void;
}

export function ProjectGithubActivity({ repos, activities, onAddRepo }: ProjectGithubActivityProps) {
  const [newRepo, setNewRepo] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newRepo.trim() && onAddRepo) {
      onAddRepo(newRepo.trim());
      setNewRepo("");
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Linked Repositories */}
      <div className="bg-[#121216] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch size={16} className="text-white/40" />
            Linked Repositories
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAdding(!isAdding)}
            className="h-8 text-xs text-primary hover:bg-primary/10"
          >
            <Plus size={14} className="mr-1" /> Add Repo
          </Button>
        </div>

        {isAdding && (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newRepo}
              onChange={(e) => setNewRepo(e.target.value)}
              placeholder="e.g. owner/repo"
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
            />
            <Button size="sm" onClick={handleAdd} className="h-[34px]">Link</Button>
          </div>
        )}

        {repos.length === 0 ? (
          <div className="text-center py-6 text-white/30 text-sm">
            No repositories linked to this project yet.
          </div>
        ) : (
          <div className="space-y-2">
            {repos.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Link2 size={14} className="text-white/40" />
                  <span>{repo.repo_full_name}</span>
                </div>
                <a 
                  href={`https://github.com/${repo.repo_full_name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <GitCommit size={16} className="text-white/40" />
          Recent Activity
        </h3>

        {activities.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-[#121216]">
            <p className="text-white/40 text-sm">No recent activity found.</p>
          </div>
        ) : (
          <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-white/10">
            {activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="relative flex items-start gap-4">
                <div className="absolute -left-[9px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0c] bg-primary shadow-[0_0_0_4px_#0a0a0c]" />
                
                <div className="flex-1 bg-[#121216] border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/90 font-medium">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-white/40">
                        <span className="text-primary/80">{activity.ref_id}</span>
                        <span>•</span>
                        <span>{activity.author}</span>
                      </div>
                    </div>
                    <span className="text-xs text-white/30 whitespace-nowrap">
                      {format(new Date(activity.timestamp), "MMM d, HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
