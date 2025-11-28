import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Submission, SubmissionStatus, AnalysisResult } from '../types';

interface DataState {
  submissions: Submission[];
  assignmentContext: string;
  isGlobalAnalyzing: boolean; // For the "Analyze All" loading state

  // Actions
  setContext: (context: string) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (id: string, updates: Partial<Submission>) => void;
  removeSubmission: (id: string) => void;
  setSubmissionResult: (id: string, result: AnalysisResult) => void;
  setSubmissionStatus: (id: string, status: SubmissionStatus, error?: string) => void;
  setGlobalAnalyzing: (isAnalyzing: boolean) => void;
  clearAll: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      submissions: [],
      assignmentContext: '',
      isGlobalAnalyzing: false,

      setContext: (context) => set({ assignmentContext: context }),

      addSubmission: (submission) => 
        set((state) => ({ 
          submissions: [submission, ...state.submissions] 
        })),

      updateSubmission: (id, updates) =>
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === id ? { ...sub, ...updates, lastUpdated: Date.now() } : sub
          ),
        })),

      removeSubmission: (id) =>
        set((state) => ({
          submissions: state.submissions.filter((sub) => sub.id !== id),
        })),

      setSubmissionResult: (id, result) =>
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === id
              ? { ...sub, status: 'done', result, errorMessage: undefined }
              : sub
          ),
        })),

      setSubmissionStatus: (id, status, error) =>
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === id
              ? { ...sub, status, errorMessage: error }
              : sub
          ),
        })),

      setGlobalAnalyzing: (isAnalyzing) => set({ isGlobalAnalyzing: isAnalyzing }),

      clearAll: () => set({ submissions: [], assignmentContext: '' }),
    }),
    {
      name: 'forensic-workspace-data', // Saves to localStorage by default
    }
  )
);