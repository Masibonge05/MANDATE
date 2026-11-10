import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/paypal/cancel-order
 *
 * PayPal redirects the buyer here when they click "Cancel and return to store"
 * in the PayPal Checkout modal or redirection flow.
 *
 * Query params provided by PayPal:
 *   - token: PayPal Order ID (matching tx.paypalOrderId)
 *
 * Actions:
 *   1. Locate pending transaction by orderId token.
 *   2. Release reserved budget on the mandate.
 *   3. Mark transaction CANCELLED.
 *   4. Record audit event.
 *   5. Redirect buyer to /ledger?status=cancelled.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    const appBaseUrl = getAppBaseUrl();

    if (!token) {
      return NextResponse.redirect(
        new URL('/ledger?status=cancelled&reason=missing_token', appBaseUrl),
      );
    }

    // Locate the transaction by paypalOrderId
    const tx = db.getTransactions().find(t => t.paypalOrderId === token);

    if (!tx) {
      return NextResponse.redirect(
        new URL(`/ledger?status=cancelled&reason=unknown_order&token=${token}`, appBaseUrl),
      );
    }

    // Only cancel if still pending payment
    if (tx.status === 'APPROVED' || tx.status === 'PAYMENT_PENDING' || tx.status === 'REQUIRES_APPROVAL') {
      // Release the reserved budget
      db.releaseReservedBudget(tx.mandateId, tx.amount);

      const now = new Date().toISOString();
      tx.status = 'CANCELLED';
      tx.paypalPaymentStatus = 'CANCELLED';
      tx.updatedAt = now;
      db.saveTransaction(tx);

      db.recordAudit({
        userId: tx.userId,
        transactionId: tx.id,
        mandateId: tx.mandateId,
        eventType: 'PAYPAL_PAYMENT_FAILED',
        severity: 'WARNING',
        title: `PayPal Checkout Cancelled by Buyer: $${tx.amount.toFixed(2)}`,
        description: `Buyer cancelled PayPal checkout for Order ${token}. Reserved budget of $${tx.amount.toFixed(2)} released.`,
        metadata: {
          orderId: token,
          previousStatus: tx.status,
          releasedAmount: tx.amount,
        },
      });
    }

    return NextResponse.redirect(
      new URL(`/ledger?status=cancelled&transactionId=${tx.id}`, appBaseUrl),
    );
  } catch (error: any) {
    console.error('[PayPal Cancel-Order Error]:', error);
    return NextResponse.redirect(
      new URL('/ledger?status=cancelled&reason=error', getAppBaseUrl()),
    );
  }
}

function getAppBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return new URL(raw);
}
