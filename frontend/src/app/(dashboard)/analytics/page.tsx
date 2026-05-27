"use client";

import React from "react";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { ProductivityChart } from "@/components/analytics/ProductivityChart";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { ProjectProgressChart } from "@/components/analytics/ProjectProgressChart";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Analytics</h1>
        <p className="text-sm text-white/40 mt-1">Track your coding productivity, streaks, and project health.</p>
      </motion.div>

      {/* KPI Overview Grid */}
      <AnalyticsOverview />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityChart />
        <ProjectProgressChart />
      </div>

      {/* Full Width Heatmap */}
      <div className="w-full">
        <ActivityHeatmap />
      </div>
    </div>
  );
}
