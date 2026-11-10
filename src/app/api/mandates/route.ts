import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Mandate } from '@/lib/types';
import { CompiledMandateSchema } from '@/lib/mandate-compiler';

export async function GET(req: Request) {
  try {
    const authUserId = req.headers.get('x-user-id');
    const mandates = authUserId
      ? db.getMandates().filter(m => m.userId === authUserId)
      : db.getMandates();
    return NextResponse.json({ mandates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mandates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CompiledMandateSchema.parse(body);

    const now = new Date();
    const expiry = new Date(now.getTime() + (validated.expiryDays || 30) * 24 * 60 * 60 * 1000);

    const newMandate: Mandate = {
      id: `man-${Math.random().toString(36).substring(2, 9)}`,
      userId: db.user.id,
      name: validated.name,
      description: validated.description,
      rawPrompt: body.rawPrompt || validated.description,
      currency: validated.currency,
      totalBudget: validated.totalBudget,
      spentAmount: 0,
      reservedAmount: 0,
      maxTransactionAmount: validated.maxTransactionAmount,
      maxQuantityPerPurchase: validated.maxQuantityPerPurchase,
      allowedCategories: validated.allowedCategories,
      restrictedCategories: validated.restrictedCategories,
      approvedMerchants: validated.approvedMerchants,
      blockedMerchants: validated.blockedMerchants,
      allowUnknownMerchants: validated.allowUnknownMerchants,
      requiresHumanApproval: validated.requiresHumanApproval,
      approvalThreshold: validated.approvalThreshold,
      approvalRequiredCategories: validated.approvalRequiredCategories,
      expiryDate: expiry.toISOString(),
      status: 'active',
      version: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.saveMandate(newMandate);

    db.recordAudit({
      userId: db.user.id,
      mandateId: newMandate.id,
      eventType: 'MANDATE_CREATED',
      severity: 'INFO',
      title: `Mandate "${newMandate.name}" Created`,
      description: `New financial policy initialized with budget $${newMandate.totalBudget.toFixed(2)} ${newMandate.currency}.`,
      metadata: { mandateId: newMandate.id, budget: newMandate.totalBudget },
    });

    return NextResponse.json({ success: true, mandate: newMandate }, { status: 201 });
  } catch (error: any) {
    console.error('[API Mandate Create Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Invalid mandate specification' },
      { status: 400 }
    );
  }
}

