import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluatePolicy } from '@/lib/policy-engine';
import { Currency } from '@/lib/types';

/**
 * Purchase validation endpoint: evaluates a proposed purchase against mandate rules
 * without creating a PayPal order. Used by Postman test 2.3 and security tests.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mandate = db.getMandate(id);

    if (!mandate) {
      return NextResponse.json(
        { error: `Mandate not found for ID: ${id}` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      merchant = 'Unknown Merchant',
      amount = 0,
      currency = mandate.currency || 'USD',
      category = 'General',
      product_id,
      description = 'Proposed Purchase',
      quantity = 1,
    } = body;

    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);

    // Validation: reject invalid amounts early
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { approved: false, error: 'Invalid transaction amount: must be a positive number' },
        { status: 422 }
      );
    }

    const evaluation = evaluatePolicy({
      mandate,
      amount: numAmount,
      currency: currency as Currency,
      quantity,
      productCategory: category,
      merchant,
      productTitle: description || product_id || 'Proposed Item',
    });

    const isApproved = evaluation.decision === 'APPROVED_BY_POLICY';
    const requiresApproval = evaluation.decision === 'REQUIRES_HUMAN_APPROVAL';
    const isBlocked = !isApproved && !requiresApproval;

    // Confirm no paypal_order_id is generated at this stage
    return NextResponse.json({
      approved: isApproved,
      requires_approval: requiresApproval,
      status: isApproved ? 'APPROVED' : requiresApproval ? 'REQUIRES_APPROVAL' : 'BLOCKED',
      reason: evaluation.explanation,
      reason_codes: evaluation.reasonCodes,
      mandate_id: id,
      evaluation: {
        decision: evaluation.decision,
        reasonCodes: evaluation.reasonCodes,
        detailedChecks: evaluation.detailedChecks,
        explanation: evaluation.explanation,
      },
      // Explicitly confirm no PayPal order was created at this stage
      paypal_order_id: null,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Mandate Validate Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to validate purchase against mandate' },
      { status: 400 }
    );
  }
}
