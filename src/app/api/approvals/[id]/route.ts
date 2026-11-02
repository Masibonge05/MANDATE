import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PayPalService } from '@/lib/paypal';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, notes } = body; // action: 'APPROVE' | 'REJECT'

    const tx = db.getTransaction(id);
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.status !== 'REQUIRES_APPROVAL') {
      return NextResponse.json({
        error: `Transaction cannot be acted upon in status: ${tx.status}`,
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === 'APPROVE') {
      // 1. Create PayPal Sandbox Order for buyer checkout approval
      let paypalOrderId = tx.paypalOrderId;
      let paypalApprovalUrl = tx.paypalApprovalUrl;

      if (!paypalOrderId) {
        const orderResult = await PayPalService.createOrder({
          transactionId: tx.id,
          amount: tx.amount,
          currency: tx.currency,
          itemTitle: tx.product.title,
          merchantName: tx.product.merchant,
        });
        paypalOrderId = orderResult.orderId;
        paypalApprovalUrl = orderResult.approvalUrl;
      }

      tx.status = 'APPROVED';
      tx.approvalStatus = 'APPROVED';
      tx.approvedBy = db.user.name;
      tx.approvedAt = now;
      tx.paypalOrderId = paypalOrderId;
      tx.paypalApprovalUrl = paypalApprovalUrl;
      tx.paypalPaymentStatus = 'READY_FOR_BUYER_APPROVAL';
      tx.updatedAt = now;

      db.saveTransaction(tx);

      db.recordAudit({
        userId: db.user.id,
        transactionId: tx.id,
        mandateId: tx.mandateId,
        eventType: 'APPROVAL_GRANTED',
        severity: 'INFO',
        title: `Exception Approved for $${tx.amount.toFixed(2)}`,
        description: `User ${db.user.name} approved exception for "${tx.product.title}". PayPal Sandbox Order ${paypalOrderId} generated.`,
        metadata: { notes, paypalOrderId },
      });

      return NextResponse.json({
        success: true,
        action: 'APPROVED',
        transaction: tx,
        paypalOrderId,
        paypalApprovalUrl,
      });

    } else if (action === 'REJECT') {
      // Release reserved budget back to the mandate
      db.releaseReservedBudget(tx.mandateId, tx.amount);

      tx.status = 'REJECTED';
      tx.approvalStatus = 'REJECTED';
      tx.rejectedReason = notes || 'Rejected by user review.';
      tx.updatedAt = now;

      db.saveTransaction(tx);

      db.recordAudit({
        userId: db.user.id,
        transactionId: tx.id,
        mandateId: tx.mandateId,
        eventType: 'APPROVAL_REJECTED',
        severity: 'WARNING',
        title: `Exception Rejected for $${tx.amount.toFixed(2)}`,
        description: `User rejected proposed transaction for "${tx.product.title}". Reserved budget was restored.`,
        metadata: { notes },
      });

      return NextResponse.json({
        success: true,
        action: 'REJECTED',
        transaction: tx,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[Approval Action Error]:', error);
    return NextResponse.json({ error: error?.message || 'Approval action failed' }, { status: 500 });
  }
}

