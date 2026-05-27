"use client";

import { useDashboardOverview } from "@/hooks/useDashboard";
import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export function StreakCard() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isError) return null;

  return (
    <GlassCard className="p-6 border-white/5 h-full flex flex-col justify-between overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full" />
      
      <div>
        <h3 className="text-lg font-semibold text-white/90">Current Streak</h3>
        <p className="text-sm text-white/50 mt-1">You're on fire! Keep it up.</p>
      </div>
      
      <div className="mt-6 flex items-center gap-3">
        {isLoading ? (
          <Skeleton className="h-16 w-32 bg-white/10 rounded-xl" />
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Flame size={32} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-white tracking-tight">
                {data?.daily_streak || 0}
              </span>
              <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Days</span>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}
