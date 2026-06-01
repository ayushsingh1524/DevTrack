"use client";

import React, { useMemo } from "react";
import { useAnalyticsStreaks } from "@/hooks/useAnalytics";
import { Loader2 } from "lucide-react";
import { format, parseISO, getDay } from "date-fns";
import { motion } from "framer-motion";

const DAY_LABELS = ["Sun", "", "Tue", "", "Thu", "", "Sat"];

export function ActivityHeatmap() {
  const { data, isLoading, isError } = useAnalyticsStreaks();

  // Build a proper 7-row (Sun-Sat) x N-column (weeks) grid
  const { weeks, monthLabels } = useMemo(() => {
    if (!data || !data.heatmap || data.heatmap.length === 0)
      return { weeks: [], monthLabels: [] };

    const sorted = [...data.heatmap].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Pad the start so the first column begins on Sunday
    const firstDayOfWeek = getDay(parseISO(sorted[0].date)); // 0=Sun
    const padded: (typeof sorted[0] | null)[] = Array(firstDayOfWeek).fill(null);
    padded.push(...sorted);

    // Build columns (each column = 1 week, 7 rows)
    const cols: (typeof sorted[0] | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      const week = padded.slice(i, i + 7);
      // Pad the last week if it has fewer than 7 days
      while (week.length < 7) week.push(null);
      cols.push(week);
    }

    // Generate month labels for the top axis
    const labels: { text: string; col: number }[] = [];
    let lastMonth = -1;
    cols.forEach((week, colIdx) => {
      const firstReal = week.find((d) => d !== null);
      if (firstReal) {
        const dt = parseISO(firstReal.date);
        const month = dt.getMonth();
        if (month !== lastMonth) {
          labels.push({ text: format(dt, "MMM"), col: colIdx });
          lastMonth = month;
        }
      }
    });

    return { weeks: cols, monthLabels: labels };
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-[220px] rounded-2xl border border-border bg-card flex items-center justify-center theme-transition apple-card">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-[220px] rounded-2xl border border-border bg-card flex items-center justify-center text-muted-foreground text-sm theme-transition apple-card">
        Failed to load heatmap data.
      </div>
    );
  }

  const getIntensityColor = (commits: number, tasks: number) => {
    const total = commits + tasks;
    if (total === 0) return "bg-foreground/[0.04]";
    if (total <= 1) return "bg-emerald-800/60";
    if (total <= 3) return "bg-emerald-600/70";
    if (total <= 5) return "bg-emerald-500/80";
    return "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-lg theme-transition apple-card"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Contribution Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.heatmap.length} days of commits &amp; tasks
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[11px] h-[11px] rounded-[2px] bg-foreground/[0.04]" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-800/60" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-600/70" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-500/80" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-1">
        <div className="flex gap-0">
          {/* Day-of-week labels column */}
          <div className="flex flex-col gap-[3px] pr-2 shrink-0 pt-[18px]">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="h-[11px] flex items-center text-[9px] text-muted-foreground leading-none select-none"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks columns */}
          <div className="flex flex-col">
            {/* Month labels row */}
            <div className="flex h-[15px] mb-[3px] relative" style={{ width: weeks.length * 14 }}>
              {monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="absolute text-[9px] text-muted-foreground select-none"
                  style={{ left: m.col * 14 }}
                >
                  {m.text}
                </span>
              ))}
            </div>

            {/* Grid of cells */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${weekIdx}-${dayIdx}`}
                          className="w-[11px] h-[11px] rounded-[2px]"
                        />
                      );
                    }
                    return (
                      <div
                        key={day.date}
                        className={`group relative w-[11px] h-[11px] rounded-[2px] transition-all duration-200 hover:scale-[1.6] hover:z-10 cursor-pointer ${getIntensityColor(day.commits, day.tasks_completed)}`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                          <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-xl flex flex-col items-center">
                            <span className="font-semibold text-foreground mb-0.5">
                              {format(parseISO(day.date), "MMM d, yyyy")}
                            </span>
                            <span className="text-muted-foreground">
                              {day.commits} commits &bull; {day.tasks_completed} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
