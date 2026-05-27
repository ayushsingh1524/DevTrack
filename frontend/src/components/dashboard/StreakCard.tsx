"use client";

import { useDashboardOverview } from "@/hooks/useDashboard";
import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export function StreakCard() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isError) return null;

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-between overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/20 blur-3xl rounded-full" />
      
      <div>
        <h3 className="text-lg font-semibold text-foreground">Current Streak</h3>
        <p className="text-sm text-muted-foreground mt-1">You&apos;re on fire! Keep it up.</p>
      </div>
      
      <div className="mt-6 flex items-center gap-3">
        {isLoading ? (
          <Skeleton className="h-16 w-32 bg-muted rounded-xl" />
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <Flame size={32} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-foreground tracking-tight">
                {data?.daily_streak || 0}
              </span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Days</span>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}
