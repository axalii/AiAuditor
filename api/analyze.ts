import { db } from '@vercel/postgres';
import { jwtVerify } from 'jose';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { text, context, token, model } = await req.json();

    // 1. Verify Token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload;
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Session Expired' }), { status: 401 });
    }

    // 2. Get User API Key
    const client = await db.connect();
    const { rows: userRows } = await client.sql`
      SELECT api_key FROM access_pins WHERE id = ${payload.pinId as string} LIMIT 1;
    `;

    if (userRows.length === 0 || !userRows[0].api_key) {
      return new Response(JSON.stringify({ error: 'API Key not found for this user' }), { status: 403 });
    }
    const USER_API_KEY = userRows[0].api_key;

    // 3. Check Duplicates
    const encoder = new TextEncoder();
    const contentData = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', contentData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const { rows: existing } = await client.sql`
      SELECT * FROM analysis_logs WHERE content_hash = ${contentHash} LIMIT 1;
    `;

    // 4. MODEL SELECTION (Strictly using your requested models)
    // If the frontend sends something else, default to flash-latest
    const targetModel = model === 'models/gemini-2.5-pro' 
      ? 'models/gemini-2.5-pro' 
      : 'models/gemini-flash-latest';

    // 5. Forensic Prompt
    const prompt = `
      Act as a Forensic Linguist. Analyze the text below for AI generation.
      CONTEXT: ${context || 'General Academic Writing'}
      
      CRITERIA:
      1. Perplexity/Burstiness: Does the text have a uniform, flat rhythm (AI) or jagged, varied sentence structures (Human)?
      2. Specificity: Does it use generic examples (AI) or messy, specific real-world details (Human)?
      3. Phrasing: Look for "In conclusion", "delve", "tapestry", "landscape" (AI markers).
      
      SCORING:
      - 0-30%: Likely Human (High burstiness, typos, specific weird details).
      - 31-70%: Mixed/Edited.
      - 71-100%: Likely AI (Perfect grammar, generic, flat rhythm).
      
      Return strictly JSON:
      {
        "ai_score": (number 0-100),
        "reasoning": (markdown string. BOLD the suspicious phrases. Be concise.)
      }
      
      TEXT: "${text.substring(0, 8000)}"
    `;

    // 6. Call Google API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${USER_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const geminiData = await geminiResponse.json();
    
    if (geminiData.error) {
      console.error("Gemini API Error:", geminiData.error);
      return new Response(JSON.stringify({ error: geminiData.error.message }), { status: 500 });
    }

    let result = { ai_score: 0, reasoning: "Analysis failed to parse." };
    try {
      const rawText = geminiData.candidates[0].content.parts[0].text;
      const jsonString = rawText.replace(/```json|```/g, '').trim();
      result = JSON.parse(jsonString);
    } catch (e) {
      result.reasoning = "Raw Output: " + (geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No content");
    }

    // 7. Log Result
    await client.sql`
      INSERT INTO analysis_logs (content_hash, ai_score, model_used)
      VALUES (${contentHash}, ${result.ai_score}, ${targetModel});
    `;

    return new Response(JSON.stringify({
      ai_score: result.ai_score,
      reasoning: result.reasoning,
      is_duplicate: existing.length > 0,
      model: targetModel
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Analysis Failed' }), { status: 500 });
  }
}