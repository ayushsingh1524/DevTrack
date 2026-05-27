"use client";

import { useEffect, useState } from "react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { BarChart2, PieChart as PieIcon } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function ProductivityChart() {
  const { data, isLoading, isError } = useDashboardStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isError) return null;

  const chartData = data?.weekly_productivity || [];

  return (
    <GlassCard className="p-6 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-chart-1" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Productivity Analysis</h3>
        </div>
        <span className="text-xs text-muted-foreground">Weekly Overview</span>
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        {!mounted || isLoading ? (
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-end justify-between flex-1 gap-2">
              <Skeleton className="h-[20%] w-[10%] bg-muted" />
              <Skeleton className="h-[40%] w-[10%] bg-muted" />
              <Skeleton className="h-[30%] w-[10%] bg-muted" />
              <Skeleton className="h-[80%] w-[10%] bg-muted" />
              <Skeleton className="h-[70%] w-[10%] bg-muted" />
              <Skeleton className="h-[15%] w-[10%] bg-muted" />
              <Skeleton className="h-[25%] w-[10%] bg-muted" />
            </div>
            <div className="flex justify-between">
              {Array(7).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4 w-8 bg-muted" />
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: -5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  color: "var(--popover-foreground)",
                }}
                labelStyle={{ color: "var(--muted-foreground)", fontWeight: "bold" }}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground ml-1">
                    {value === "hours" ? "Coding Hours" : "Tasks Completed"}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#hoursGrad)"
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="var(--chart-3)"
                strokeWidth={2.5}
                dot={{ fill: "var(--chart-3)", r: 4, strokeWidth: 1, stroke: "var(--card)" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function LanguageStats() {
  const { data, isLoading, isError } = useDashboardStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isError) return null;

  const languageData = data?.language_stats || [];

  return (
    <GlassCard className="p-6 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieIcon className="text-chart-4" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Language Distribution</h3>
        </div>
        <span className="text-xs text-muted-foreground">Technologies</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 min-h-0 w-full relative">
        {!mounted || isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="h-44 w-44 rounded-full bg-muted" />
          </div>
        ) : (
          <>
            <div className="w-full md:w-1/2 h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {languageData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="var(--card)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      color: "var(--popover-foreground)",
                    }}
                    itemStyle={{ color: "var(--foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
              {languageData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-semibold text-foreground/80">{entry.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{entry.value}%</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${entry.value}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}
