"use client";

import Link from "next/link";
import { ArrowRight, Code2, Kanban, LineChart, Notebook } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col overflow-hidden relative theme-transition">
      {/* Background gradients - theme aware */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-chart-4/5 dark:bg-violet-900/20 blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">DevTrack</span>
        </div>
        <div>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-6"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-20 md:mt-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-8">
          <span className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
          Production Ready
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          Ship software faster, <br className="hidden md:block" />
          manage chaos better.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          The all-in-one developer workspace. Kanban boards, rich markdown notes, GitHub integration, and real-time productivity analytics built for high-performance teams.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="group flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {isAuthenticated ? "Enter Dashboard" : "Start Building Free"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center mb-4">
              <Kanban className="w-5 h-5 text-chart-1" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Kanban</h3>
            <p className="text-muted-foreground text-sm">Drag and drop tasks with optimistic UI updates and instant WebSockets sync.</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center mb-4">
              <LineChart className="w-5 h-5 text-chart-2" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground text-sm">Track your developer velocity, commit streaks, and project completion metrics.</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center mb-4">
              <Notebook className="w-5 h-5 text-chart-4" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Markdown Notes</h3>
            <p className="text-muted-foreground text-sm">Notion-style rich text markdown editor with auto-save and seamless shortcuts.</p>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-8 text-center text-muted-foreground text-sm relative z-10 border-t border-border">
        &copy; {new Date().getFullYear()} DevTrack Inc. Built for developers.
      </footer>
    </div>
  );
}
