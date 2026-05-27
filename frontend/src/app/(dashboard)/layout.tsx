"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { WebSocketProvider } from "@/providers/WebSocketProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <WebSocketProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative z-10">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
}
