import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const analytics = db.getAnalytics();
    const recentAudits = db.getAuditEvents(20);

    return NextResponse.json({
      success: true,
      analytics,
      recentAudits,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}

