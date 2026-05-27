import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

/**
 * Returns the resolved theme based on time of day.
 * Dark between 7pm (19:00) and 6am (06:00), light otherwise.
 */
export function getAutoTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6 ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'auto',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'devtrack-theme',
    }
  )
);
