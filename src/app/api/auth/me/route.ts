import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json({
      user: db.user,
      authenticated: true,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

