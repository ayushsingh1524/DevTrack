"use client";

import React from "react";
import { format } from "date-fns";
import { useGithubStatus, useGithubStats, useConnectGithub, useDisconnectGithub, useSyncGithub } from "@/hooks/useGithub";
import { GithubStatsGrid } from "@/components/github/GithubStatsGrid";
import { LanguageDonutChart } from "@/components/github/LanguageDonutChart";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { GitBranch as Github, RefreshCw, Unplug, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function GithubPage() {
  const { data: status, isLoading: statusLoading } = useGithubStatus();
  
  // Only query stats if connected
  const { data: stats, isLoading: statsLoading } = useGithubStats(!!status?.is_connected);

  const connect = useConnectGithub();
  const disconnect = useDisconnectGithub();
  const sync = useSyncGithub();

  const isSyncing = stats?.commits === 0 && !!stats; // We set commits=0 temporarily during sync
  const isInitialLoading = statusLoading || (status?.is_connected && statsLoading);

  const [token, setToken] = React.useState("");

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-white/40" size={32} />
      </div>
    );
  }

  // Unconnected State
  if (!status?.is_connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d1117] rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center w-full max-w-md text-center p-8"
        >
          <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/10">
            <Github size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Connect to GitHub</h1>
          <p className="text-white/60 mb-6 leading-relaxed">
            Link your GitHub account using a Personal Access Token (PAT) to automatically track your commits, pull requests, and analyze your most used languages.
          </p>
          <div className="w-full flex flex-col gap-3">
            <input 
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[#010409] border border-[#30363d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <Button 
              onClick={() => connect.mutate(token)}
              disabled={connect.isPending || !token}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-semibold shadow-lg transition-all h-12"
            >
              {connect.isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : <Github size={18} className="mr-2" />}
              Connect GitHub Account
            </Button>
          </div>
          <p className="text-xs text-white/40 mt-4 text-left w-full">
            * Needs <span className="text-white/70 bg-white/10 px-1 rounded">repo</span> and <span className="text-white/70 bg-white/10 px-1 rounded">read:user</span> scopes.
          </p>
        </motion.div>
      </div>
    );
  }

  // Connected Dashboard State
  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Github size={28} />
            GitHub Overview
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Connected as <span className="font-semibold text-white/80">@{status?.username}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/40 text-right hidden sm:block">
            Last synced: <br />
            {status?.last_synced ? format(new Date(status.last_synced), "MMM d, h:mm a") : 'Never'}
          </div>
          <Button 
            onClick={() => sync.mutate()}
            disabled={sync.isPending || isSyncing}
            variant="outline"
            className="bg-[#21262d] border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e] text-white"
          >
            <RefreshCw size={14} className={`mr-2 ${(sync.isPending || isSyncing) ? 'animate-spin text-blue-400' : ''}`} />
            Sync Now
          </Button>
          <Button 
            onClick={() => { if (confirm("Disconnect GitHub account?")) disconnect.mutate(); }}
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <Unplug size={14} />
          </Button>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <GithubStatsGrid stats={stats as any} isSyncing={isSyncing} />

      {/* Charts Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LanguageDonutChart stats={stats as any} isSyncing={isSyncing} />
        </div>
        <div className="lg:col-span-2">
          {/* Reusing Activity Heatmap which plots commits/tasks for the user */}
          <div className="h-full">
            <ActivityHeatmap />
          </div>
        </div>
      </div>
    </div>
  );
}
