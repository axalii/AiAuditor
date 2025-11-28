import { supabase } from './supabase';

// --- Types ---

export interface AuthResponse {
  token: string;
  label: string;
  expiresIn: number;
}

export interface AnalysisResponse {
  aiScore: number;
  reasoning: string;
  isDuplicate: boolean;
  modelUsed: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

// --- API Functions ---

/**
 * Verifies the PIN against the 'auth-session' Edge Function.
 * @param pin The 6-digit PIN entered by the user.
 */
export const verifyPin = async (pin: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.functions.invoke('auth-session', {
    body: { pin },
  });

  if (error) {
    console.error('Auth Error:', error);
    throw new Error('Access Denied: Invalid PIN or System Error.');
  }

  if (!data || !data.token) {
    throw new Error('Invalid response from security node.');
  }

  return {
    token: data.token,
    label: data.label || 'Unknown User',
    expiresIn: data.expiresIn || 3600,
  };
};

/**
 * Sends text to the 'analyze-text' Edge Function.
 * @param text The student submission content.
 * @param context The teacher's assignment context.
 * @param token The session token from auth.
 */
export const analyzeSubmission = async (
  text: string, 
  context: string, 
  token: string
): Promise<AnalysisResponse> => {
  
  const { data, error } = await supabase.functions.invoke('analyze-text', {
    body: { text, context, token },
  });

  if (error) {
    // Handle specific Supabase Function errors
    const message = error.context?.json?.error || 'Analysis failed due to a network error.';
    throw new Error(message);
  }

  return {
    aiScore: data.ai_score ?? 0,
    reasoning: data.reasoning ?? 'No reasoning provided.',
    isDuplicate: data.is_duplicate ?? false,
    modelUsed: data.model ?? 'gemini-standard',
  };
};

/**
 * A specialized error handler that returns user-friendly messages.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'An unknown system error occurred.';
};