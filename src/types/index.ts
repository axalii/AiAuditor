export type SubmissionStatus = 'idle' | 'analyzing' | 'done' | 'error';

export interface AnalysisResult {
  aiScore: number;       // 0 to 100
  reasoning: string;     // Markdown string
  isDuplicate: boolean;  // True if content hash matches DB
  modelUsed: string;     // e.g., 'gemini-1.5-flash'
  timestamp: string;     // ISO Date string
}

export interface Submission {
  id: string;
  studentName: string;
  content: string;
  status: SubmissionStatus;
  result: AnalysisResult | null;
  errorMessage?: string;
  lastUpdated: number; // Date.now()
}

export interface AuthSession {
  token: string;
  label: string; // e.g., "Professor X"
  expiresAt: number;
}