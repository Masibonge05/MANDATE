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

    // Normalize snake_case or shorthand inputs (such as Postman test payloads)
    const normalized = {
      name: body.name || body.title || 'AI Agent Financial Mandate',
      description: body.description || body.rawPrompt || 'Automated purchasing policy for autonomous agent',
      currency: body.currency || 'USD',
      totalBudget: body.totalBudget ?? body.budget_limit ?? 500,
      maxTransactionAmount: body.maxTransactionAmount ?? body.single_transaction_limit ?? body.budget_limit ?? 150,
      maxQuantityPerPurchase: body.maxQuantityPerPurchase ?? body.max_quantity ?? 1,
      allowedCategories: body.allowedCategories ?? body.allowed_categories ?? [],
      restrictedCategories: body.restrictedCategories ?? body.category_restrictions ?? [],
      approvedMerchants: body.approvedMerchants ?? body.approved_merchants ?? [],
      blockedMerchants: body.blockedMerchants ?? body.blocked_merchants ?? [],
      allowUnknownMerchants: body.allowUnknownMerchants ?? body.allow_unknown_merchants ?? false,
      requiresHumanApproval: body.requiresHumanApproval ?? (body.requires_approval_above !== undefined ? true : false),
      approvalThreshold: body.approvalThreshold ?? body.requires_approval_above ?? 0,
      approvalRequiredCategories: body.approvalRequiredCategories ?? body.approval_required_categories ?? [],
      expiryDays: body.expiryDays ?? body.expiry_days ?? 30,
    };

    const validated = CompiledMandateSchema.parse(normalized);

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

    // Return both top-level fields (for Postman tests) and nested mandate (for UI)
    return NextResponse.json({
      ...newMandate,
      id: newMandate.id,
      budget_limit: newMandate.totalBudget,
      active: newMandate.status === 'active',
      success: true,
      mandate: newMandate,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API Mandate Create Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Invalid mandate specification' },
      { status: 400 }
    );
  }
}
