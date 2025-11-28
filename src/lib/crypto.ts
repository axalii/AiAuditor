/**
 * Generates a cryptographically strong UUID (v4).
 * Used for creating unique IDs for submissions locally.
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments (unlikely needed for modern React, but safe)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generates a SHA-256 hash of a text string.
 * useful for comparing content changes or optimistic duplicate detection.
 * 
 * @param text The content to hash
 * @returns Hex string of the hash
 */
export const hashText = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Simple delay helper for simulating processing time in UI (for effect).
 * @param ms Milliseconds to wait
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));