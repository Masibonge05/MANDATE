import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PayPalService } from '@/lib/paypal';

// In-memory cache of processed webhook event IDs
const PROCESSED_WEBHOOK_IDS = new Set<string>();

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const eventId = event?.id || `evt-${Date.now()}`;
    const eventType = event?.event_type;
    const resource = event?.resource;

    console.log(`[PayPal Webhook Received]: ${eventType} (ID: ${eventId})`);

    // 1. Idempotency Check: prevent duplicate event processing
    if (PROCESSED_WEBHOOK_IDS.has(eventId) || db.isWebhookProcessed(eventId)) {
      console.log(`[PayPal Webhook] Duplicate event ${eventId} ignored.`);
      return NextResponse.json({
        received: true,
        eventId,
        status: 'duplicate_ignored',
        message: 'Webhook event was previously processed.',
      });
    }

    // 2. Webhook Signature Verification
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId && PayPalService.isConfigured()) {
      const transmissionId = req.headers.get('paypal-transmission-id');
      const transmissionTime = req.headers.get('paypal-transmission-time');
      const signature = req.headers.get('paypal-transmission-sig');
      const certUrl = req.headers.get('paypal-cert-url');
      const authAlgo = req.headers.get('paypal-auth-algo') || undefined;

      if (!transmissionId || !transmissionTime || !signature || !certUrl) {
        return NextResponse.json({
          error: 'Missing required PayPal verification headers (transmission-id, transmission-time, transmission-sig, cert-url)',
        }, { status: 400 });
      }

      const verificationResult = await PayPalService.verifyWebhookSignature({
        transmissionId,
        transmissionTime,
        transmissionSig: signature,
        certUrl,
        authAlgo,
        webhookId,
        rawBody,
      });

      if (!verificationResult.verified) {
        console.warn(`[PayPal Webhook] Signature verification failed: ${verificationResult.reason}`);
        return NextResponse.json({
          error: 'Webhook signature verification failed',
          details: verificationResult.reason,
        }, { status: 401 });
      }
    }

    // Mark event ID as processed
    PROCESSED_WEBHOOK_IDS.add(eventId);

    // 3. Process Only Relevant Events
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureId = resource?.id;
      const amount = parseFloat(resource?.amount?.value || '0');
      const orderId = resource?.supplementary_data?.related_ids?.order_id;

      // Find the specific transaction belonging to this order or capture
      const tx = db.getTransactions().find(t => 
        (orderId && t.paypalOrderId === orderId) || 
        (captureId && t.paypalCaptureId === captureId)
      );

      if (!tx) {
        db.recordAudit({
          userId: db.user.id,
          eventType: 'PAYPAL_PAYMENT_CAPTURED',
          severity: 'WARNING',
          title: 'PayPal Webhook: Unknown Transaction for Capture',
          description: `Received capture completed webhook for capture ${captureId} / order ${orderId}, but no matching transaction exists.`,
          metadata: { eventId, eventType, captureId, orderId },
        });

        return NextResponse.json({ received: true, eventId, status: 'unmatched_transaction' });
      }

      // Security: ensure action is performed only on the transaction owner
      if (tx.status !== 'PAID') {
        db.commitReservedPayment(tx.mandateId, tx.amount);
        tx.status = 'PAID';
        tx.paypalCaptureId = captureId || tx.paypalCaptureId;
        tx.paypalPaymentStatus = 'COMPLETED';
        tx.updatedAt = new Date().toISOString();
        db.saveTransaction(tx);
      }

      db.recordAudit({
        userId: tx.userId,
        transactionId: tx.id,
        mandateId: tx.mandateId,
        eventType: 'PAYPAL_PAYMENT_CAPTURED',
        severity: 'INFO',
        title: `PayPal Webhook: Capture Completed`,
        description: `Verified webhook delivery for Capture ${captureId} ($${amount || tx.amount}). Mandate budget finalized.`,
        metadata: { eventId, eventType, captureId, orderId, userId: tx.userId },
      });

    } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      const captureId = resource?.id;
      const orderId = resource?.supplementary_data?.related_ids?.order_id;

      const tx = db.getTransactions().find(t => 
        (orderId && t.paypalOrderId === orderId) || 
        (captureId && t.paypalCaptureId === captureId)
      );

      if (tx) {
        // If funds were reserved and not yet paid/failed, release the reserved budget
        if (tx.status !== 'PAID' && tx.status !== 'PAYMENT_FAILED') {
          db.releaseReservedBudget(tx.mandateId, tx.amount);
          tx.status = 'PAYMENT_FAILED';
          tx.paypalCaptureId = captureId || tx.paypalCaptureId;
          tx.paypalPaymentStatus = 'DENIED';
          tx.updatedAt = new Date().toISOString();
          db.saveTransaction(tx);
        }

        db.recordAudit({
          userId: tx.userId,
          transactionId: tx.id,
          mandateId: tx.mandateId,
          eventType: 'PAYPAL_PAYMENT_FAILED',
          severity: 'ALERT',
          title: `PayPal Webhook: Capture Denied`,
          description: `PayPal webhook notified that Capture ${captureId} was DENIED. Reserved budget released.`,
          metadata: { eventId, eventType, captureId, orderId, userId: tx.userId },
        });
      } else {
        db.recordAudit({
          userId: db.user.id,
          eventType: 'PAYPAL_PAYMENT_FAILED',
          severity: 'WARNING',
          title: 'PayPal Webhook: Capture Denied for Unknown Order',
          description: `Capture denied for unknown order ${orderId} / capture ${captureId}.`,
          metadata: { eventId, eventType, captureId, orderId },
        });
      }

    } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = resource?.id;
      const tx = db.getTransactions().find(t => t.paypalOrderId === orderId);

      if (tx) {
        if (tx.status === 'APPROVED') {
          tx.paypalPaymentStatus = 'APPROVED_BY_BUYER';
          tx.updatedAt = new Date().toISOString();
          db.saveTransaction(tx);
        }

        db.recordAudit({
          userId: tx.userId,
          transactionId: tx.id,
          mandateId: tx.mandateId,
          eventType: 'PAYPAL_ORDER_APPROVED',
          severity: 'INFO',
          title: `PayPal Webhook: Order Approved by Buyer`,
          description: `Buyer approved Order ${orderId} in PayPal Checkout. Ready for server capture.`,
          metadata: { eventId, eventType, orderId, userId: tx.userId },
        });
      }

    } else {
      // Any other irrelevant event types
      return NextResponse.json({
        received: true,
        eventId,
        status: 'unhandled_event_ignored',
        eventType,
      });
    }

    return NextResponse.json({ received: true, eventId, status: 'processed' });

  } catch (error: any) {
    console.error('[PayPal Webhook Error]:', error);
    return NextResponse.json({ error: error?.message || 'Webhook processing failed' }, { status: 500 });
  }
}
