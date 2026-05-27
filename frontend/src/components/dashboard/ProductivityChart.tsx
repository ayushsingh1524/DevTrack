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
    <GlassCard className="p-6 border-white/5 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white/90">Productivity Analysis</h3>
        </div>
        <span className="text-xs text-white/40">Weekly Overview</span>
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        {!mounted || isLoading ? (
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-end justify-between flex-1 gap-2">
              <Skeleton className="h-[20%] w-[10%] bg-white/10" />
              <Skeleton className="h-[40%] w-[10%] bg-white/10" />
              <Skeleton className="h-[30%] w-[10%] bg-white/10" />
              <Skeleton className="h-[80%] w-[10%] bg-white/10" />
              <Skeleton className="h-[70%] w-[10%] bg-white/10" />
              <Skeleton className="h-[15%] w-[10%] bg-white/10" />
              <Skeleton className="h-[25%] w-[10%] bg-white/10" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-8 bg-white/10" />
              <Skeleton className="h-4 w-8 bg-white/10" />
              <Skeleton className="h-4 w-8 bg-white/10" />
              <Skeleton className="h-4 w-8 bg-white/10" />
              <Skeleton className="h-4 w-8 bg-white/10" />
              <Skeleton className="h-4 w-8 bg-white/10" />
              <Skeleton className="h-4 w-8 bg-white/10" />
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
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 12, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(8px)",
                }}
                labelStyle={{ color: "rgba(255, 255, 255, 0.5)", fontWeight: "bold" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-white/70 ml-1">
                    {value === "hours" ? "Coding Hours" : "Tasks Completed"}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#hoursGrad)"
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ fill: "#f97316", r: 4, strokeWidth: 1, stroke: "#18181b" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7"];

export function LanguageStats() {
  const { data, isLoading, isError } = useDashboardStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isError) return null;

  const languageData = data?.language_stats || [];

  return (
    <GlassCard className="p-6 border-white/5 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieIcon className="text-purple-400" size={20} />
          <h3 className="text-lg font-semibold text-white/90">Language Distribution</h3>
        </div>
        <span className="text-xs text-white/40">Technologies</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 min-h-0 w-full relative">
        {!mounted || isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="h-44 w-44 rounded-full bg-white/10" />
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
                        stroke="rgba(0,0,0,0.4)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 12, 0.9)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(8px)",
                    }}
                    itemStyle={{ color: "#fff" }}
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
                      <span className="text-sm font-semibold text-white/80">{entry.name}</span>
                    </div>
                    <span className="text-xs text-white/50">{entry.value}%</span>
                  </div>
                  
                  {/* Custom animated/harmonious progress bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${entry.value}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                        boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}33`
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
