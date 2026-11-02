import { NextResponse } from 'next/server';
import { db, DEMO_USER } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // For Demo / Hackathon evaluation
    if (email) {
      db.user.email = email;
      db.user.name = email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());
    } else {
      db.user = { ...DEMO_USER };
    }

    db.recordAudit({
      userId: db.user.id,
      eventType: 'MANDATE_UPDATED',
      severity: 'INFO',
      title: 'User Authenticated',
      description: `Session established for ${db.user.email}.`,
      metadata: { email: db.user.email },
    });

    return NextResponse.json({
      success: true,
      user: db.user,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
  }
}

