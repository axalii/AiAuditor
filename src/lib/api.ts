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

/**
 * Verifies the PIN against the Vercel API.
 */
export const verifyPin = async (pin: string): Promise<AuthResponse> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Access Denied');
  }

  return {
    token: data.token,
    label: data.label,
    expiresIn: data.expiresIn,
  };
};

/**
 * Sends text to the Vercel API for analysis.
 * Now accepts 'model' to switch between Flash and Pro.
 */
export const analyzeSubmission = async (
  text: string, 
  context: string, 
  token: string,
  model: string
): Promise<AnalysisResponse> => {
  
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context, token, model }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Analysis failed');
  }

  return {
    aiScore: data.ai_score,
    reasoning: data.reasoning,
    isDuplicate: data.is_duplicate,
    modelUsed: data.model,
  };
};

/**
 * Helper to extract error messages safely
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'An unknown system error occurred.';
};