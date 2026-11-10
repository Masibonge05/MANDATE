import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PayPalService } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, transactionId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Find associated transaction
    let tx = transactionId ? db.getTransaction(transactionId) : undefined;
    if (!tx) {
      tx = db.getTransactions().find(t => t.paypalOrderId === orderId);
    }

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found for this order ID' }, { status: 404 });
    }

    // Idempotency: Return early if already captured and paid
    if (tx.status === 'PAID') {
      return NextResponse.json({
        success: true,
        alreadyCaptured: true,
        message: 'Order has already been captured and finalized.',
        transaction: tx,
      });
    }

    // Terminal states: Do not retry capture if transaction was already cancelled or expired or failed
    if (tx.status === 'PAYMENT_FAILED' || tx.status === 'CANCELLED' || tx.status === 'EXPIRED') {
      return NextResponse.json({
        error: `Cannot capture: transaction is already in terminal state ${tx.status}.`,
      }, { status: 409 });
    }

    // Security violation: Never capture an order if transaction is BLOCKED, REJECTED, or still REQUIRES_APPROVAL
    if (tx.status === 'BLOCKED' || tx.status === 'REJECTED' || tx.status === 'REQUIRES_APPROVAL') {
      return NextResponse.json({
        error: `Security violation: Cannot capture payment for ${tx.status} transaction (Requires human authorization first)`,
      }, { status: 403 });
    }

    // Capture the approved PayPal order from the server
    const captureResult = await PayPalService.captureOrder(orderId);

    // CRITICAL: Verify capture.status === 'COMPLETED' before marking PAID or committing budget
    if (captureResult.status !== 'COMPLETED') {
      // Capture was not completed (e.g. DENIED, FAILED, PENDING)
      // Release the reserved budget back to the mandate
      db.releaseReservedBudget(tx.mandateId, tx.amount);

      const now = new Date().toISOString();
      tx.status = 'PAYMENT_FAILED';
      tx.paypalCaptureId = captureResult.captureId;
      tx.paypalPaymentStatus = captureResult.status;
      tx.updatedAt = now;
      db.saveTransaction(tx);

      db.recordAudit({
        userId: tx.userId,
        transactionId: tx.id,
        mandateId: tx.mandateId,
        eventType: 'PAYPAL_PAYMENT_FAILED',
        severity: 'WARNING',
        title: `PayPal Capture ${captureResult.status}: $${tx.amount.toFixed(2)}`,
        description: `PayPal capture returned status ${captureResult.status} (not COMPLETED). Reserved budget of $${tx.amount.toFixed(2)} released. Capture ID: ${captureResult.captureId}.`,
        metadata: {
          orderId,
          captureId: captureResult.captureId,
          captureStatus: captureResult.status,
          amount: tx.amount,
        },
      });

      return NextResponse.json({
        success: false,
        error: `PayPal capture did not complete: status was ${captureResult.status}`,
        captureStatus: captureResult.status,
        transaction: tx,
      }, { status: 402 });
    }

    // Capture is confirmed COMPLETED — commit financial budget atomically
    db.commitReservedPayment(tx.mandateId, tx.amount);

    const now = new Date().toISOString();
    tx.status = 'PAID';
    tx.paypalCaptureId = captureResult.captureId;
    tx.paypalPaymentStatus = captureResult.status;
    tx.updatedAt = now;

    db.saveTransaction(tx);

    // Immutable audit entry
    db.recordAudit({
      userId: tx.userId,
      transactionId: tx.id,
      mandateId: tx.mandateId,
      eventType: 'PAYPAL_PAYMENT_CAPTURED',
      severity: 'INFO',
      title: `PayPal Sandbox Payment Verified: $${tx.amount.toFixed(2)}`,
      description: `Payment captured successfully on PayPal Sandbox (Capture ID: ${captureResult.captureId}). Mandate budget deducted.`,
      metadata: {
        orderId,
        captureId: captureResult.captureId,
        payerEmail: captureResult.payerEmail,
        amount: tx.amount,
      },
    });

    return NextResponse.json({
      success: true,
      capture: captureResult,
      transaction: tx,
    });

  } catch (error: any) {
    const msg = error?.message || '';
    const isUnapproved = msg.includes('ORDER_NOT_APPROVED') || msg.includes('422');
    return NextResponse.json({
      error: isUnapproved ? 'ORDER_NOT_APPROVED: Payer has not yet approved the order on PayPal Sandbox.' : (error?.message || 'PayPal capture failed on server'),
      details: msg,
    }, { status: isUnapproved ? 422 : 500 });
  }
}
