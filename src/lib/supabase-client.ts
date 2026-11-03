/**
 * MANDATE - Supabase Cloud Persistence Bridge
 * Safely persists transactions, mandates, and immutable audit events to Supabase PostgreSQL.
 */

import type { Mandate, Transaction, AuditEvent, Agent } from './types.ts';

export class SupabaseBridge {
  private static get url(): string | undefined {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  private static get key(): string | undefined {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  public static isConfigured(): boolean {
    return Boolean(this.url && this.key);
  }

  private static async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${endpoint}`, {
        ...options,
        headers: {
          'apikey': this.key!,
          'Authorization': `Bearer ${this.key!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          ...(options.headers || {}),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn(`[Supabase Bridge] ${endpoint} returned ${res.status}:`, text);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.warn(`[Supabase Bridge] Request to ${endpoint} failed:`, err);
      return null;
    }
  }

  public static async persistMandate(mandate: Mandate): Promise<void> {
    if (!this.isConfigured()) return;
    const payload = {
      id: mandate.id,
      name: mandate.name,
      description: mandate.description,
      raw_prompt: mandate.rawPrompt,
      currency: mandate.currency,
      total_budget: mandate.totalBudget,
      spent_amount: mandate.spentAmount,
      reserved_amount: mandate.reservedAmount,
      max_transaction_amount: mandate.maxTransactionAmount,
      max_quantity_per_purchase: mandate.maxQuantityPerPurchase,
      allowed_categories: mandate.allowedCategories,
      restricted_categories: mandate.restrictedCategories,
      approved_merchants: mandate.approvedMerchants,
      blocked_merchants: mandate.blockedMerchants,
      allow_unknown_merchants: mandate.allowUnknownMerchants,
      requires_human_approval: mandate.requiresHumanApproval,
      approval_threshold: mandate.approvalThreshold,
      approval_required_categories: mandate.approvalRequiredCategories,
      expiry_date: mandate.expiryDate,
      status: mandate.status,
      version: mandate.version,
      updated_at: new Date().toISOString(),
    };

    await this.request('mandates', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(payload),
    });
  }

  public static async persistTransaction(tx: Transaction): Promise<void> {
    if (!this.isConfigured()) return;
    const payload = {
      id: tx.id,
      idempotency_key: tx.idempotencyKey,
      agent_id: tx.agentId,
      agent_name: tx.agentName,
      mandate_id: tx.mandateId,
      mandate_name: tx.mandateName,
      mandate_version: tx.mandateVersion,
      product: tx.product,
      amount: tx.amount,
      currency: tx.currency,
      agent_reasoning: tx.agentReasoning,
      policy_decision: tx.policyDecision,
      policy_evaluation: tx.policyEvaluation,
      ai_review: tx.aiReview,
      status: tx.status,
      approval_status: tx.approvalStatus,
      approval_reason: tx.approvalReason,
      approved_by: tx.approvedBy,
      approved_at: tx.approvedAt,
      rejected_reason: tx.rejectedReason,
      paypal_order_id: tx.paypalOrderId,
      paypal_capture_id: tx.paypalCaptureId,
      paypal_payment_status: tx.paypalPaymentStatus,
      paypal_approval_url: tx.paypalApprovalUrl,
      updated_at: new Date().toISOString(),
    };

    await this.request('transactions', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(payload),
    });
  }

  public static async persistAudit(audit: AuditEvent): Promise<void> {
    if (!this.isConfigured()) return;
    const payload = {
      id: audit.id,
      transaction_id: audit.transactionId || null,
      mandate_id: audit.mandateId || null,
      agent_id: audit.agentId || null,
      event_type: audit.eventType,
      severity: audit.severity,
      title: audit.title,
      description: audit.description,
      metadata: audit.metadata,
      timestamp: audit.timestamp,
    };

    await this.request('audit_events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
