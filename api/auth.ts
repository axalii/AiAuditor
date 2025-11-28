import { db } from '@vercel/postgres';
import { SignJWT } from 'jose';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { pin } = await req.json();
    if (!pin) return new Response('PIN required', { status: 400 });

    // 1. Hash PIN
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // 2. Find User & Check if they have an API Key configured
    const client = await db.connect();
    const { rows } = await client.sql`
      SELECT id, label, api_key FROM access_pins WHERE pin_hash = ${inputHash} LIMIT 1;
    `;
    
    if (rows.length === 0) return new Response(JSON.stringify({ error: 'Invalid PIN' }), { status: 401 });
    
    const user = rows[0];
    if (!user.api_key) return new Response(JSON.stringify({ error: 'No API Key assigned to this PIN' }), { status: 403 });

    // 3. Sign Token with the User ID (NOT the API key, keep that safe in DB)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ 
      label: user.label, 
      pinId: user.id // <--- We save this to look up the key later
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('4h')
      .sign(secret);

    return new Response(JSON.stringify({ token, label: user.label, expiresIn: 14400 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Auth System Error' }), { status: 500 });
  }
}