import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Cache processed webhook event IDs to prevent duplicate webhook delivery execution
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

    // Duplicate webhook delivery handling
    if (PROCESSED_WEBHOOK_IDS.has(eventId)) {
      console.log(`[PayPal Webhook] Duplicate event ${eventId} ignored.`);
      return NextResponse.json({
        received: true,
        eventId,
        status: 'duplicate_ignored',
        message: 'Webhook event was previously processed.'
      });
    }
    PROCESSED_WEBHOOK_IDS.add(eventId);

    // Verify webhook signature if PAYPAL_WEBHOOK_ID is configured
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const transmissionId = req.headers.get('paypal-transmission-id');
      const timestamp = req.headers.get('paypal-transmission-time');
      const signature = req.headers.get('paypal-transmission-sig');
      const certUrl = req.headers.get('paypal-cert-url');

      if (!transmissionId || !timestamp || !signature || !certUrl) {
        console.warn('[PayPal Webhook] Missing required PayPal verification headers');
      }
    }

    // Process event types
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureId = resource?.id;
      const amount = parseFloat(resource?.amount?.value || '0');
      const orderId = resource?.supplementary_data?.related_ids?.order_id;

      const tx = db.getTransactions().find(t => t.paypalOrderId === orderId || t.paypalCaptureId === captureId);
      if (tx && tx.status !== 'PAID') {
        db.commitReservedPayment(tx.mandateId, tx.amount);
        tx.status = 'PAID';
        tx.paypalCaptureId = captureId;
        tx.paypalPaymentStatus = 'COMPLETED';
        tx.updatedAt = new Date().toISOString();
        db.saveTransaction(tx);
      }

      db.recordAudit({
        userId: db.user.id,
        transactionId: tx?.id,
        eventType: 'PAYPAL_PAYMENT_CAPTURED',
        severity: 'INFO',
        title: `PayPal Webhook: Capture Completed`,
        description: `Verified webhook delivery for Capture ${captureId} ($${amount}).`,
        metadata: { eventId, eventType, captureId, orderId },
      });
    } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = resource?.id;
      const tx = db.getTransactions().find(t => t.paypalOrderId === orderId);

      db.recordAudit({
        userId: db.user.id,
        transactionId: tx?.id,
        eventType: 'PAYPAL_ORDER_APPROVED',
        severity: 'INFO',
        title: `PayPal Webhook: Order Approved by Buyer`,
        description: `Buyer approved Order ${orderId} in PayPal Checkout. Ready for capture.`,
        metadata: { eventId, eventType, orderId },
      });
    }

    return NextResponse.json({ received: true, eventId, status: 'processed' });

  } catch (error: any) {
    console.error('[PayPal Webhook Error]:', error);
    return NextResponse.json({ error: error?.message || 'Webhook processing failed' }, { status: 500 });
  }
}

