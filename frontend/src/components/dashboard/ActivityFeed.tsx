"use client";

import { useDashboardActivity } from "@/hooks/useDashboard";
import { GitCommit, GitMerge, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export function ActivityFeed() {
  const { data, isLoading, isError } = useDashboardActivity();

  if (isError) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'commit': return <GitCommit size={16} className="text-chart-1" />;
      case 'pr_merged': return <GitMerge size={16} className="text-chart-4" />;
      case 'issue_closed': return <CheckCircle size={16} className="text-chart-2" />;
      default: return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </div>
      
      <div className="space-y-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            </div>
          ))
        ) : (
          data?.map((item: any, index: number) => (
            <div key={item.id} className="relative flex gap-4 group">
              {/* Timeline connector line */}
              {index !== data.length - 1 && (
                <div className="absolute left-4 top-8 bottom-[-24px] w-[1px] bg-border group-hover:bg-primary/30 transition-colors" />
              )}
              
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shrink-0">
                {getIcon(item.type)}
              </div>
              
              <div className="flex flex-col">
                <p className="text-sm font-medium text-foreground/80 leading-tight">
                  {item.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{item.repo}</span>
                  <span className="text-muted-foreground/50 text-[10px]">•</span>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
