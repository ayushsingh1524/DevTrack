"use client";

import { useDashboardOverview } from "@/hooks/useDashboard";
import { Flame, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export function StreakCard() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isError) return null;

  return (
    <div className="flex flex-col gap-6 h-[400px]">
      <GlassCard className="p-6 flex-1 flex flex-col justify-between overflow-hidden relative">
        {/* Decorative gradient blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/20 blur-3xl rounded-full" />
        
        <div>
          <h3 className="text-lg font-semibold text-foreground">Current Streak</h3>
          <p className="text-sm text-muted-foreground mt-1">You&apos;re on fire! Keep it up.</p>
        </div>
        
        <div className="mt-4 flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-14 w-24 bg-muted rounded-xl" />
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <Flame size={28} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {data?.current_streak_days || 0}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Days</span>
              </div>
            </>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6 flex-1 flex flex-col justify-between overflow-hidden relative">
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full" />
        
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weekly Goal</h3>
          <p className="text-sm text-muted-foreground mt-1">Tasks completed this week.</p>
        </div>
        
        <div className="mt-4 flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-14 w-24 bg-muted rounded-xl" />
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Target size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {data?.total_completed_tasks || 0}<span className="text-xl text-muted-foreground">/10</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Completed</span>
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
