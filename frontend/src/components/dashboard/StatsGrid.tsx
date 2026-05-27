"use client";

import { useDashboardOverview } from "@/hooks/useDashboard";
import { FolderKanban, CheckSquare, Flame, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";

export function StatsGrid() {
  const { data, isLoading, isError } = useDashboardOverview();

  const statsItems = [
    {
      title: "Active Projects",
      value: data?.active_projects || 0,
      icon: FolderKanban,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Pending Tasks",
      value: data?.pending_tasks || 0,
      icon: CheckSquare,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      title: "Coding Hours",
      value: data?.total_coding_hours || 0,
      icon: Clock,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  if (isError) {
    return <div className="text-red-400">Failed to load overview data.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {isLoading
        ? Array(3)
            .fill(0)
            .map((_, i) => (
              <GlassCard key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-6 w-12 bg-white/10" />
                  </div>
                </div>
              </GlassCard>
            ))
        : statsItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <GlassCard className="p-6 transition-all hover:bg-white/[0.08] group border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                    <item.icon className={`${item.color}`} size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/50">{item.title}</p>
                    <h3 className="text-2xl font-bold text-white group-hover:scale-105 transition-transform transform origin-left">
                      {item.value}
                    </h3>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
    </div>
  );
}
