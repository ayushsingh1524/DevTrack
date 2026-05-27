"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  LineChart, 
  StickyNote, 
  GitBranch as Github, 
  Settings 
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Notes", href: "/notes", icon: StickyNote },
  { name: "GitHub Stats", href: "/github", icon: Github },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex flex-col justify-between hidden md:flex">
      <div>
        <div className="flex h-16 items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">DevTrack</span>
          </Link>
        </div>
        
        <nav className="flex flex-col gap-1 px-4 mt-6">
          <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "text-white bg-white/10" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "text-white/40 group-hover:text-white/80")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 group",
            pathname.startsWith("/settings") 
              ? "text-white bg-white/10" 
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings size={18} className="text-white/40 group-hover:text-white/80" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
