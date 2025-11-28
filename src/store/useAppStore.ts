import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isSidebarCollapsed: boolean;
  privacyMode: boolean; // If true, tells backend NOT to log data
  themeMode: 'dark' | 'light' | 'system';

  // Actions
  toggleSidebar: () => void;
  setPrivacyMode: (enabled: boolean) => void;
  setThemeMode: (mode: 'dark' | 'light' | 'system') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      privacyMode: false,
      themeMode: 'system',

      toggleSidebar: () => 
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      setPrivacyMode: (enabled) => 
        set({ privacyMode: enabled }),

      setThemeMode: (mode) => 
        set({ themeMode: mode }),
    }),
    {
      name: 'forensic-ui-prefs',
    }
  )
);