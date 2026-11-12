import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluatePolicy } from '@/lib/policy-engine';
import { reviewTransactionWithAI } from '@/lib/ai-reviewer';
import { resolveTransactionDecision } from '@/lib/decision-matrix';
import { PayPalService } from '@/lib/paypal';
import { Transaction, Currency } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      agentId = 'agt-aura-001',
      mandateId,
      idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product,
      amount,
      currency = 'USD',
      quantity = 1,
      agentReasoning = 'Autonomous agent identified this product as matching the user intent.',
    } = body;

    // 1. Validation & Identity Checks
    if (!mandateId) {
      return NextResponse.json({ error: 'mandateId is required' }, { status: 400 });
    }

    const mandate = db.getMandate(mandateId);
    if (!mandate) {
      return NextResponse.json({ error: `Mandate not found for ID: ${mandateId}` }, { status: 404 });
    }

    const agent = db.getAgent(agentId) || {
      id: agentId,
      name: 'External AI Purchasing Agent',
      type: 'shopping',
    };

    // 2. Check Idempotency (prevent duplicate submissions)
    const existingTx = db.getTransactionByIdempotency(idempotencyKey);
    if (existingTx) {
      return NextResponse.json({
        success: false,
        error: 'Duplicate transaction detected with this idempotency key',
        transaction: existingTx,
      }, { status: 409 });
    }

    const txAmount = typeof amount === 'number' ? amount : parseFloat(product?.price || '0');
    const txCurrency = (currency || product?.currency || 'USD') as Currency;

    // 3. Layer 1: Deterministic Policy Engine Evaluation (MATHEMATICAL / STRICT CODE)
    const policyEvaluation = evaluatePolicy({
      mandate,
      amount: txAmount,
      currency: txCurrency,
      quantity: quantity || 1,
      productCategory: product?.category || 'Uncategorized',
      merchant: product?.merchant || 'Unknown Merchant',
      productTitle: product?.title || 'Unknown Product',
    });

    // 4. Layer 2: AI Intent & Risk Review (PROMPT INJECTION & INTENT DEFENSE)
    const aiReview = await reviewTransactionWithAI({
      mandate,
      agentReasoning,
      product: {
        title: product?.title || '',
        description: product?.description || '',
        merchant: product?.merchant || '',
        category: product?.category || '',
        price: txAmount,
        currency: txCurrency,
      },
    });

    // 5. Synthesis: Combined Decision Resolution
    const decisionOutcome = resolveTransactionDecision(policyEvaluation, aiReview);

    // 6. Concurrency-Safe Budget Reservation
    // If approved or requiring approval, reserve the budget atomically
    let budgetReserved = false;
    if (decisionOutcome.status === 'APPROVED' || decisionOutcome.status === 'REQUIRES_APPROVAL') {
      budgetReserved = db.reserveBudget(mandate.id, txAmount);
      if (!budgetReserved) {
        // Concurrency collision: another transaction just reserved the remaining budget!
        decisionOutcome.status = 'BLOCKED';
        decisionOutcome.primaryReason = 'Atomic reservation failed: Insufficient unreserved mandate budget.';
        decisionOutcome.isBlocked = true;
        decisionOutcome.canProceedToPayment = false;
        decisionOutcome.requiresHumanAction = false;
      }
    }

    const txId = `tx-${Math.random().toString(36).substring(2, 9)}`;

    // 7. If approved by policy & low risk, pre-create PayPal sandbox order for seamless payment
    let paypalOrderId: string | undefined;
    let paypalApprovalUrl: string | undefined;

    if (decisionOutcome.status === 'APPROVED') {
      try {
        const orderResult = await PayPalService.createOrder({
          transactionId: txId,
          amount: txAmount,
          currency: txCurrency,
          itemTitle: product?.title || 'Authorized Item',
          merchantName: product?.merchant || 'Authorized Merchant',
        });
        paypalOrderId = orderResult.orderId;
        paypalApprovalUrl = orderResult.approvalUrl;
      } catch (err) {
        console.warn('[Gateway] PayPal order initialization deferred:', err);
      }
    }

    // 8. Assemble Transaction Record
    const transaction: Transaction = {
      id: txId,
      idempotencyKey,
      userId: db.user.id,
      agentId: agent.id,
      agentName: agent.name,
      mandateId: mandate.id,
      mandateName: mandate.name,
      mandateVersion: mandate.version,
      product: {
        id: product?.id || `p-${Math.random().toString(36).substring(2, 7)}`,
        title: product?.title || 'Proposed Product',
        merchant: product?.merchant || 'Proposed Merchant',
        category: product?.category || 'General',
        price: txAmount,
        currency: txCurrency,
        quantity: quantity || 1,
        imageUrl: product?.imageUrl || '',
        source: product?.isSampleData ? 'Demo Catalogue' : 'Live Discovery Provider',
      },
      amount: txAmount,
      currency: txCurrency,
      agentReasoning,
      policyDecision: policyEvaluation.decision,
      policyEvaluation,
      aiReview,
      status: decisionOutcome.status,
      approvalStatus: decisionOutcome.requiresHumanAction ? 'PENDING' : decisionOutcome.status === 'APPROVED' ? 'APPROVED' : 'NOT_REQUIRED',
      approvalReason: decisionOutcome.requiresHumanAction ? decisionOutcome.primaryReason : undefined,
      paypalOrderId,
      paypalApprovalUrl,
      paypalPaymentStatus: decisionOutcome.status === 'APPROVED' ? 'READY_FOR_BUYER_APPROVAL' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveTransaction(transaction);

    // 9. Append-Only Audit Logging
    db.recordAudit({
      userId: db.user.id,
      transactionId: transaction.id,
      mandateId: mandate.id,
      agentId: agent.id,
      eventType: transaction.status === 'BLOCKED' 
        ? 'TRANSACTION_BLOCKED' 
        : transaction.status === 'REQUIRES_APPROVAL' 
        ? 'APPROVAL_REQUESTED' 
        : 'POLICY_EVALUATED',
      severity: transaction.status === 'BLOCKED' 
        ? 'ALERT' 
        : transaction.status === 'REQUIRES_APPROVAL' 
        ? 'WARNING' 
        : 'INFO',
      title: `Gateway Evaluation: ${transaction.status}`,
      description: `${agent.name} proposed $${txAmount.toFixed(2)} purchase at "${product?.merchant}". Result: ${decisionOutcome.primaryReason}`,
      metadata: {
        amount: txAmount,
        currency: txCurrency,
        decision: transaction.status,
        promptInjection: aiReview.prompt_injection_detected,
        policyReasonCodes: policyEvaluation.reasonCodes,
      },
    });

    // HTTP status reflects the security decision:
    //   200 = APPROVED / REQUIRES_APPROVAL (transaction created, needs further action)
    //   422 = BLOCKED (policy boundary enforced, no PayPal order created)
    const responseStatus = decisionOutcome.status === 'BLOCKED' ? 422 : 200;

    return NextResponse.json({
      success: decisionOutcome.status !== 'BLOCKED',
      decision: transaction.status,
      approved: decisionOutcome.status === 'APPROVED',
      blocked: decisionOutcome.status === 'BLOCKED',
      requires_approval: decisionOutcome.status === 'REQUIRES_APPROVAL',
      error: decisionOutcome.status === 'BLOCKED' ? decisionOutcome.primaryReason : undefined,
      transaction,
      outcome: decisionOutcome,
    }, { status: responseStatus });

  } catch (error: any) {
    console.error('[Gateway Exception]:', error);
    return NextResponse.json({
      error: error?.message || 'Gateway transaction proposal evaluation failed',
    }, { status: 500 });
  }
}

