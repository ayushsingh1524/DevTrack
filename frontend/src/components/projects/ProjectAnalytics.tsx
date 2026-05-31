"use client";

import React from "react";
import { ProjectAnalytics as AnalyticsType } from "@/services/project.service";
import { CheckCircle2, Clock, ListTodo, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectAnalyticsProps {
  analytics: AnalyticsType;
}

export function ProjectAnalytics({ analytics }: ProjectAnalyticsProps) {
  const cards = [
    {
      title: "Total Tasks",
      value: analytics.total_tasks,
      icon: <ListTodo size={20} className="text-blue-400" />,
      bg: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: analytics.completed_tasks,
      icon: <CheckCircle2 size={20} className="text-green-400" />,
      bg: "bg-green-500/10",
    },
    {
      title: "Pending",
      value: analytics.pending_tasks,
      icon: <Clock size={20} className="text-yellow-400" />,
      bg: "bg-yellow-500/10",
    },
    {
      title: "Overdue",
      value: analytics.overdue_tasks,
      icon: <AlertCircle size={20} className="text-red-400" />,
      bg: "bg-red-500/10",
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
          className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white/40">{card.title}</p>
            <p className="text-2xl font-bold text-white/90">{card.value}</p>
          </div>
        </motion.div>
      ))}
      
      {/* Charts Grid */}
      <div className="col-span-2 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Progress Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-white/5 bg-gradient-to-br from-[#121216] to-[#0c0c0e] p-5 shadow-inner relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-white/80">Project Completion</h3>
              <p className="text-xs text-white/40 mt-1">Based on task statuses</p>
            </div>
            <span className="text-4xl font-extrabold text-white">{analytics.completion_percentage}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden relative z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analytics.completion_percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
        </motion.div>

        {/* Burndown Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-white/5 bg-[#121216] p-5 relative overflow-hidden"
        >
          <h3 className="text-sm font-semibold text-white/80 mb-4">Task Burndown</h3>
          <div className="h-24 flex items-end justify-between gap-1 mt-auto">
            {/* Simple CSS-based mock chart for aesthetic purposes */}
            {[100, 95, 80, 75, 60, 50, 30, 20, 15, 5].map((val, i) => (
              <div key={i} className="w-full relative group h-full flex items-end">
                <div 
                  className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors"
                  style={{ height: `${val}%` }}
                />
                <div 
                  className="absolute bottom-0 w-full bg-white/5 rounded-t-sm"
                  style={{ height: `${100 - val}%`, opacity: 0.3 }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
