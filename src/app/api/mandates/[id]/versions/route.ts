import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mandate = db.getMandate(id);
    if (!mandate) {
      return NextResponse.json({ error: 'Mandate not found' }, { status: 404 });
    }

    const versions = db.getMandateVersions(id);
    return NextResponse.json({
      success: true,
      mandateId: id,
      currentVersion: mandate.version,
      versions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve mandate versions' }, { status: 500 });
  }
}

