import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Mandate deactivation endpoint.
 * Accepts POST /api/mandates/:id/deactivate to pause or permanently revoke a mandate.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = db.getMandate(id);

    if (!existing) {
      return NextResponse.json(
        { error: `Mandate not found for ID: ${id}` },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetStatus = body.action === 'revoke' ? 'revoked' : 'paused';

    const updated = db.updateMandateStatus(id, targetStatus);

    db.recordAudit({
      userId: db.user.id,
      mandateId: existing.id,
      eventType: targetStatus === 'revoked' ? 'MANDATE_REVOKED' : 'MANDATE_PAUSED',
      severity: 'WARNING',
      title: `Mandate "${existing.name}" ${targetStatus === 'revoked' ? 'Revoked' : 'Paused'}`,
      description: `Mandate deactivated by user request. Status set to ${targetStatus}.`,
      metadata: { previousStatus: existing.status, newStatus: targetStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Mandate ${targetStatus === 'revoked' ? 'permanently revoked' : 'paused'} successfully`,
      mandate: updated,
      active: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to deactivate mandate' },
      { status: 500 }
    );
  }
}
