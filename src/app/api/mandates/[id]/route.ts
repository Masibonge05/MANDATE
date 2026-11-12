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

    // Return both top-level and nested mandate object for maximum test compatibility
    return NextResponse.json({
      ...mandate,
      mandate,
      budget_limit: mandate.totalBudget,
      active: mandate.status === 'active',
    });
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

    const authUserId = req.headers.get('x-user-id') || db.user.id;
    if (existing.userId !== authUserId) {
      return NextResponse.json({ error: 'Forbidden: Cannot modify another user tenant mandate' }, { status: 403 });
    }

    // Status change
    if (body.status && ['active', 'paused', 'revoked'].includes(body.status)) {
      const updated = db.updateMandateStatus(id, body.status);
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update mandate status' }, { status: 500 });
      }
      return NextResponse.json({
        ...updated,
        success: true,
        mandate: updated,
        budget_limit: updated.totalBudget,
        active: updated.status === 'active',
      });
    }

    // Map snake_case fields from Postman tests if present
    const budgetLimit = body.budget_limit !== undefined ? Number(body.budget_limit) : body.totalBudget;
    const singleTxLimit = body.single_transaction_limit !== undefined ? Number(body.single_transaction_limit) : body.maxTransactionAmount;

    // Field updates with version bump
    const updated = {
      ...existing,
      ...body,
      totalBudget: budgetLimit !== undefined ? budgetLimit : existing.totalBudget,
      maxTransactionAmount: singleTxLimit !== undefined ? singleTxLimit : existing.maxTransactionAmount,
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

    return NextResponse.json({
      ...updated,
      success: true,
      mandate: updated,
      budget_limit: updated.totalBudget,
      single_transaction_limit: updated.maxTransactionAmount,
      active: updated.status === 'active',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = db.getMandate(id);

    if (!existing) {
      return NextResponse.json({ error: 'Mandate not found' }, { status: 404 });
    }

    const updated = db.updateMandateStatus(id, 'revoked');

    db.recordAudit({
      userId: db.user.id,
      mandateId: existing.id,
      eventType: 'MANDATE_REVOKED',
      severity: 'WARNING',
      title: `Mandate "${existing.name}" Revoked`,
      description: 'Mandate deactivated and revoked by user request.',
      metadata: { previousStatus: existing.status, newStatus: 'revoked' },
    });

    return NextResponse.json({
      success: true,
      message: 'Mandate deactivated and revoked',
      mandate: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to revoke mandate' }, { status: 500 });
  }
}
