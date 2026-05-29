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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col justify-between hidden md:flex theme-transition">
      <div>
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-transparent">
              <img src="/logo.png" alt="TaskNest Logo" className="w-full h-full object-cover scale-[1.35]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">TaskNest</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 mt-6">
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "text-primary bg-sidebar-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-[3px] h-5 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
            pathname.startsWith("/settings")
              ? "text-primary bg-sidebar-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Settings size={18} className="text-muted-foreground group-hover:text-foreground" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
