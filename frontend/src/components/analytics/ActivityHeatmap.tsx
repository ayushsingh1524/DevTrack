"use client";

import React, { useMemo } from "react";
import { useAnalyticsStreaks } from "@/hooks/useAnalytics";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

export function ActivityHeatmap() {
  const { data, isLoading, isError } = useAnalyticsStreaks();

  const columns = useMemo(() => {
    if (!data || !data.heatmap) return [];
    
    const cols: any[][] = [];
    let currentWeek: any[] = [];
    
    // Sort chronologically just in case
    const sorted = [...data.heatmap].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === sorted.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });
    return cols;
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-[220px] rounded-2xl border border-white/5 bg-[#121216] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-[220px] rounded-2xl border border-white/5 bg-[#121216] flex items-center justify-center text-white/30 text-sm">
        Failed to load heatmap data.
      </div>
    );
  }

  const getIntensityColor = (commits: number) => {
    if (commits === 0) return "bg-white/[0.03] border-white/5";
    if (commits === 1) return "bg-primary/20 border-primary/30";
    if (commits === 2) return "bg-primary/40 border-primary/50";
    if (commits === 3) return "bg-primary/60 border-primary/70";
    if (commits >= 4) return "bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]";
    return "bg-white/[0.03] border-white/5";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-[220px] rounded-2xl border border-white/5 bg-[#121216] p-6 shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">Contribution Activity</h2>
          <p className="text-sm text-white/40 mt-1">90 days of commits and task completions</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/[0.03] border border-white/5" />
            <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/40 border border-primary/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/60 border border-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary border border-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-x-auto overflow-y-hidden custom-scrollbar pb-2 -mx-2 px-2">
        <div className="flex gap-1.5 h-[105px]">
          {columns.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1.5 justify-end h-full">
              {week.map((day, dayIdx) => (
                <div
                  key={day.date}
                  className={`group relative w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] border transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${getIntensityColor(day.commits)}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl flex flex-col items-center">
                      <span className="font-semibold text-white/90 mb-1">{format(parseISO(day.date), "MMM d, yyyy")}</span>
                      <span className="text-white/60">{day.commits} Commits • {day.tasks_completed} Tasks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
