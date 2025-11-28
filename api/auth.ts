import { db } from '@vercel/postgres';
import { SignJWT } from 'jose';

export const config = {
  runtime: 'edge', // Makes it super fast
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { pin } = await req.json();

    if (!pin) return new Response('PIN required', { status: 400 });

    // 1. Hash the input PIN to match the database format
    // We use Web Crypto API which is available in Edge Runtime
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // 2. Check Database
    const client = await db.connect();
    const { rows } = await client.sql`
      SELECT * FROM access_pins WHERE pin_hash = ${inputHash} LIMIT 1;
    `;
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid PIN' }), { status: 401 });
    }

    const user = rows[0];

    // 3. Generate a Session Token (JWT)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
    const token = await new SignJWT({ label: user.label })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(secret);

    // 4. Update Usage Count (Optional, non-blocking)
    // We don't await this to keep response fast
    client.sql`UPDATE access_pins SET usage_count = usage_count + 1 WHERE id = ${user.id}`;

    return new Response(JSON.stringify({ 
      token, 
      label: user.label,
      expiresIn: 7200 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'System Error' }), { status: 500 });
  }
}