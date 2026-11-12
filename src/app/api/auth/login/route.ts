import { NextResponse } from 'next/server';
import { db, DEMO_USER } from '@/lib/db';

/**
 * Authentication endpoint.
 * Returns a demo bearer token for use in Postman authorization headers.
 * In production this would integrate with Supabase Auth.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Set active demo user based on supplied email
    if (email) {
      db.user.email = email;
      db.user.name = email
        .split('@')[0]
        .replace('.', ' ')
        .replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
    } else {
      db.user = { ...DEMO_USER };
    }

    // Produce a stable demo token from the user ID
    const demoToken = Buffer.from(`${db.user.id}:${Date.now()}`).toString('base64');

    db.recordAudit({
      userId: db.user.id,
      eventType: 'MANDATE_UPDATED',
      severity: 'INFO',
      title: 'User Authenticated',
      description: `Session established for ${db.user.email}.`,
      metadata: { email: db.user.email },
    });

    // Return both Supabase-style and direct token for Postman test compatibility
    return NextResponse.json({
      success: true,
      access_token: demoToken,
      token_type: 'bearer',
      expires_in: 3600,
      user: db.user,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
  }
}
