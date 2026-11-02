import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    db.seed();
    return NextResponse.json({
      success: true,
      message: 'Demonstration environment successfully reset to baseline seed state.',
      mandate: db.getMandates()[0],
      analytics: db.getAnalytics(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to reset demo state' }, { status: 500 });
  }
}

