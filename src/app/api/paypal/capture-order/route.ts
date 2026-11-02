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

    // Never capture an order if transaction is BLOCKED or REJECTED
    if (tx.status === 'BLOCKED' || tx.status === 'REJECTED') {
      return NextResponse.json({
        error: `Security violation: Cannot capture payment for ${tx.status} transaction`,
      }, { status: 403 });
    }

    // Capture the approved PayPal order from the server
    const captureResult = await PayPalService.captureOrder(orderId);

    // Commit financial budget atomically
    db.commitReservedPayment(tx.mandateId, tx.amount);

    const now = new Date().toISOString();
    tx.status = 'PAID';
    tx.paypalCaptureId = captureResult.captureId;
    tx.paypalPaymentStatus = captureResult.status;
    tx.updatedAt = now;

    db.saveTransaction(tx);

    // Immutable audit entry
    db.recordAudit({
      userId: db.user.id,
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
    console.error('[PayPal Capture API Error]:', error);
    return NextResponse.json({
      error: error?.message || 'PayPal capture failed on server',
    }, { status: 500 });
  }
}

