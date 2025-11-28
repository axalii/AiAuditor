import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// STRICTLY using your requested model strings
export type ModelType = 'models/gemini-flash-latest' | 'models/gemini-2.5-pro';

interface AppState {
  isSidebarCollapsed: boolean;
  privacyMode: boolean;
  selectedModel: ModelType;

  toggleSidebar: () => void;
  setPrivacyMode: (enabled: boolean) => void;
  setSelectedModel: (model: ModelType) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      privacyMode: false,
      selectedModel: 'models/gemini-flash-latest', // Default

      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setPrivacyMode: (enabled) => set({ privacyMode: enabled }),
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    { name: 'forensic-ui-prefs' }
  )
);