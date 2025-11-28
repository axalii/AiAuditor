import { db } from '@vercel/postgres';
import { jwtVerify } from 'jose';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { text, context, token } = await req.json();

    // 1. Verify Session Token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
    try {
      await jwtVerify(token, secret);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Session Expired' }), { status: 401 });
    }

    // 2. Check for Duplicates (Plagiarism Check)
    // Hash the content to compare
    const encoder = new TextEncoder();
    const contentData = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', contentData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const client = await db.connect();
    const { rows: existing } = await client.sql`
      SELECT * FROM analysis_logs WHERE content_hash = ${contentHash} LIMIT 1;
    `;

    // 3. Call Google Gemini API
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const prompt = `
      You are a forensic linguistics expert. Analyze the following student text for AI generation patterns.
      Context: ${context || 'General Academic Assignment'}.
      
      Return strictly JSON format:
      {
        "ai_score": (number 0-100),
        "reasoning": (markdown string with bold highlights for suspicious phrases)
      }
      
      Text to analyze:
      "${text.substring(0, 5000)}"
    `;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const geminiData = await geminiResponse.json();
    
    // Parse Gemini Response (Safety handling)
    let result = { ai_score: 0, reasoning: "Analysis failed to parse." };
    try {
      const rawText = geminiData.candidates[0].content.parts[0].text;
      // Clean markdown code blocks if present
      const jsonString = rawText.replace(/```json|```/g, '').trim();
      result = JSON.parse(jsonString);
    } catch (e) {
      console.error("Gemini Parse Error", e);
    }

    // 4. Log the Analysis
    // We use event.waitUntil if available, or just await it
    await client.sql`
      INSERT INTO analysis_logs (content_hash, ai_score, model_used)
      VALUES (${contentHash}, ${result.ai_score}, 'gemini-2.5-flash');
    `;

    return new Response(JSON.stringify({
      ai_score: result.ai_score,
      reasoning: result.reasoning,
      is_duplicate: existing.length > 0,
      model: 'gemini-2.5-flash'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Analysis Failed' }), { status: 500 });
  }
}