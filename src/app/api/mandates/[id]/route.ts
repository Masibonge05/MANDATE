import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mandate = db.getMandate(id);

    if (!mandate) {
      return NextResponse.json({ error: 'Mandate not found' }, { status: 404 });
    }

    return NextResponse.json({ mandate });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mandate' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = db.getMandate(id);

    if (!existing) {
      return NextResponse.json({ error: 'Mandate not found' }, { status: 404 });
    }

    // Status change
    if (body.status && ['active', 'paused', 'revoked'].includes(body.status)) {
      const updated = db.updateMandateStatus(id, body.status);
      return NextResponse.json({ success: true, mandate: updated });
    }

    // Field updates with version bump
    const updated = {
      ...existing,
      ...body,
      id: existing.id,
      userId: existing.userId,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    db.saveMandate(updated);

    db.recordAudit({
      userId: db.user.id,
      mandateId: updated.id,
      eventType: 'MANDATE_UPDATED',
      severity: 'INFO',
      title: `Mandate "${updated.name}" Updated (v${updated.version})`,
      description: 'Financial controls modified by user.',
      metadata: { changes: body, version: updated.version },
    });

    return NextResponse.json({ success: true, mandate: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 400 });
  }
}

