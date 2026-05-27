"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useThemeStore, getAutoTheme } from "@/store/themeStore";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore();
  const [resolvedDefault, setResolvedDefault] = useState<string>("dark");

  // Resolve the 'auto' mode on mount and every 60 seconds
  useEffect(() => {
    if (mode === "auto") {
      setResolvedDefault(getAutoTheme());
      const interval = setInterval(() => {
        setResolvedDefault(getAutoTheme());
      }, 60_000);
      return () => clearInterval(interval);
    } else {
      setResolvedDefault(mode);
    }
  }, [mode]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={resolvedDefault}
      forcedTheme={mode === "auto" ? resolvedDefault : mode}
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
