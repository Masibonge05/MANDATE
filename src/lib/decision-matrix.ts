/**
 * MANDATE - Combined Decision Resolution Matrix
 * Synthesizes the Deterministic Policy Engine evaluation with the AI Risk Review.
 * 
 * CORE FINTECH PRINCIPLE:
 * Deterministic rules are absolute. The AI reviewer CANNOT authorize a transaction
 * that failed deterministic policy checks, but CAN escalate a passed transaction
 * to BLOCKED or REQUIRES_APPROVAL if malicious behavior or anomalies are discovered.
 */

import type { PolicyEvaluation, AIReviewResult, TransactionLifecycleStatus } from './types.ts';

export interface FinalDecisionOutcome {
  status: TransactionLifecycleStatus;
  primaryReason: string;
  isBlocked: boolean;
  requiresHumanAction: boolean;
  canProceedToPayment: boolean;
}

export function resolveTransactionDecision(
  policy: PolicyEvaluation,
  aiReview: AIReviewResult
): FinalDecisionOutcome {
  // Layer 1: Deterministic Engine Rules Are Supreme
  if (policy.decision === 'INVALID') {
    return {
      status: 'BLOCKED',
      primaryReason: policy.explanation,
      isBlocked: true,
      requiresHumanAction: false,
      canProceedToPayment: false,
    };
  }

  if (policy.decision === 'BLOCKED' || policy.decision === 'DUPLICATE') {
    return {
      status: 'BLOCKED',
      primaryReason: policy.explanation,
      isBlocked: true,
      requiresHumanAction: false,
      canProceedToPayment: false,
    };
  }

  // Layer 2: Defense in Depth Against Adversarial Prompt Injections
  if (aiReview.prompt_injection_detected) {
    return {
      status: 'BLOCKED',
      primaryReason: `BLOCKED BY AI GUARDIAN: Prompt injection attack detected in listing. (${aiReview.explanation})`,
      isBlocked: true,
      requiresHumanAction: false,
      canProceedToPayment: false,
    };
  }

  // Layer 3: Critical AI Risk / High Risk Recommendations
  if (aiReview.risk_level === 'HIGH' || aiReview.recommendation === 'BLOCK') {
    return {
      status: 'BLOCKED',
      primaryReason: `BLOCKED BY AI SECURITY: High transaction risk detected. (${aiReview.explanation})`,
      isBlocked: true,
      requiresHumanAction: false,
      canProceedToPayment: false,
    };
  }

  // Layer 4: Deterministic Policy flagged human review requirement (e.g. category 'electronics')
  if (policy.decision === 'REQUIRES_HUMAN_APPROVAL') {
    return {
      status: 'REQUIRES_APPROVAL',
      primaryReason: policy.explanation,
      isBlocked: false,
      requiresHumanAction: true,
      canProceedToPayment: false,
    };
  }

  // Layer 5: AI Flagged Intent Mismatch or Medium Risk (Escalation to Human Review)
  if (!aiReview.intent_match || aiReview.risk_level === 'MEDIUM' || aiReview.recommendation === 'REQUIRE_HUMAN_REVIEW') {
    return {
      status: 'REQUIRES_APPROVAL',
      primaryReason: `ESCALATED TO HUMAN REVIEW: ${aiReview.explanation}`,
      isBlocked: false,
      requiresHumanAction: true,
      canProceedToPayment: false,
    };
  }

  // Layer 6: Clean Bill of Health - Both Layers Passed
  return {
    status: 'APPROVED',
    primaryReason: 'Deterministic policies satisfied and AI risk evaluation confirmed low risk.',
    isBlocked: false,
    requiresHumanAction: false,
    canProceedToPayment: true,
  };
}
