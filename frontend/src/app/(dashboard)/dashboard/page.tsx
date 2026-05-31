"use client";

import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ProductivityChart, LanguageStats } from "@/components/dashboard/ProductivityChart";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { MyOpenTasks } from "@/components/dashboard/MyOpenTasks";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header section with page introduction */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500/80">Command Center</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
            Dashboard
          </h1>
          <p className="text-sm text-white/40">
            Welcome back! Review your streaks, tasks, and project insights in one place.
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </motion.div>

      {/* Overview Stats (3 cards grid) */}
      <StatsGrid />

      {/* Three-column data widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <MyOpenTasks />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ActiveProjects />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <RecentNotes />
        </motion.div>
      </div>

      {/* Main interactive visualization and feed grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main insights column (Left side on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Composed Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ProductivityChart />
          </motion.div>

          {/* Secondary stats split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <LanguageStats />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <StreakCard />
            </motion.div>
          </div>
        </div>

        {/* Actionable timeline feed (Right side on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-1 h-full min-h-[400px]"
        >
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  );
}
