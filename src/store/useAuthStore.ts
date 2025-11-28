import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  sessionToken: string | null;
  userLabel: string | null; // Display name for the UI
  
  // Actions
  login: (token: string, label: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      sessionToken: null,
      userLabel: null,

      login: (token, label) => set({ 
        isAuthenticated: true, 
        sessionToken: token, 
        userLabel: label 
      }),

      logout: () => set({ 
        isAuthenticated: false, 
        sessionToken: null, 
        userLabel: null 
      }),
    }),
    {
      name: 'forensic-auth-storage',
      // CRITICAL: Use sessionStorage instead of localStorage.
      // This ensures the session dies when the tab is closed.
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);