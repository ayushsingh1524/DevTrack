"use client";

import React from "react";
import { GithubStats } from "@/services/github.service";
import { GitCommit, GitPullRequest, BookMarked, Code2 } from "lucide-react";
import { motion } from "framer-motion";

interface GithubStatsGridProps {
  stats: GithubStats;
  isSyncing: boolean;
}

export function GithubStatsGrid({ stats, isSyncing }: GithubStatsGridProps) {
  const cards = [
    {
      title: "Total Commits",
      value: stats.commits,
      icon: <GitCommit size={24} className="text-white" />,
      bg: "bg-[#2ea043]",
    },
    {
      title: "Repositories",
      value: stats.repositories,
      icon: <BookMarked size={24} className="text-white" />,
      bg: "bg-[#0969da]",
    },
    {
      title: "Pull Requests",
      value: stats.pull_requests,
      icon: <GitPullRequest size={24} className="text-white" />,
      bg: "bg-[#8250df]",
    },
    {
      title: "Languages Used",
      value: Object.keys(stats.top_languages || {}).length,
      icon: <Code2 size={24} className="text-white" />,
      bg: "bg-[#bf8700]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex flex-col justify-center rounded-2xl border border-white/10 bg-[#0d1117] p-5 relative overflow-hidden"
        >
          <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} shadow-lg`}>
            {card.icon}
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tight">
              {isSyncing ? <span className="animate-pulse">--</span> : card.value}
            </p>
            <p className="text-sm font-medium text-white/40 mt-1">{card.title}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
