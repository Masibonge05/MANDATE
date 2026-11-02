import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTransactionDecision } from '../lib/decision-matrix.ts';
import type { PolicyEvaluation, AIReviewResult } from '../lib/types.ts';

describe('MANDATE Combined Decision Matrix', () => {
  const passingPolicy: PolicyEvaluation = {
    decision: 'APPROVED_BY_POLICY',
    reasonCodes: [],
    checks: { budget_available: true, merchant_approved: true },
    detailedChecks: [],
    explanation: 'All policy checks satisfied.',
  };

  const blockingPolicy: PolicyEvaluation = {
    decision: 'BLOCKED',
    reasonCodes: ['AMOUNT_EXCEEDS_TRANSACTION_LIMIT'],
    checks: { amount_within_tx_limit: false },
    detailedChecks: [],
    explanation: 'Amount exceeds transaction limit.',
  };

  const approvalPolicy: PolicyEvaluation = {
    decision: 'REQUIRES_HUMAN_APPROVAL',
    reasonCodes: ['CATEGORY_REQUIRES_APPROVAL:Electronics'],
    checks: {},
    detailedChecks: [],
    explanation: 'Category Electronics requires human approval.',
  };

  const safeAIReview: AIReviewResult = {
    risk_level: 'LOW',
    intent_match: true,
    prompt_injection_detected: false,
    price_anomaly: false,
    merchant_concern: false,
    explanation: 'Standard compliant purchase.',
    recommendation: 'ALLOW',
    analyzedAt: new Date().toISOString(),
    modelUsed: 'test',
  };

  const maliciousInjectionReview: AIReviewResult = {
    risk_level: 'HIGH',
    intent_match: false,
    prompt_injection_detected: true,
    price_anomaly: true,
    merchant_concern: true,
    explanation: 'Adversarial prompt injection detected.',
    recommendation: 'BLOCK',
    analyzedAt: new Date().toISOString(),
    modelUsed: 'test',
  };

  it('approves a transaction when both deterministic policy and AI review are clean', () => {
    const outcome = resolveTransactionDecision(passingPolicy, safeAIReview);
    assert.equal(outcome.status, 'APPROVED');
    assert.equal(outcome.canProceedToPayment, true);
    assert.equal(outcome.isBlocked, false);
    assert.equal(outcome.requiresHumanAction, false);
  });

  it('BLOCKS a transaction when deterministic policy fails, even if AI says safe', () => {
    const outcome = resolveTransactionDecision(blockingPolicy, safeAIReview);
    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(outcome.canProceedToPayment, false);
    assert.equal(outcome.isBlocked, true);
  });

  it('BLOCKS a transaction when AI detects prompt injection, even if deterministic rules passed', () => {
    const outcome = resolveTransactionDecision(passingPolicy, maliciousInjectionReview);
    assert.equal(outcome.status, 'BLOCKED');
    assert.equal(outcome.canProceedToPayment, false);
    assert.equal(outcome.isBlocked, true);
    assert.ok(outcome.primaryReason.includes('Prompt injection attack detected'));
  });

  it('ESCALATES to REQUIRES_APPROVAL when policy requires approval', () => {
    const outcome = resolveTransactionDecision(approvalPolicy, safeAIReview);
    assert.equal(outcome.status, 'REQUIRES_APPROVAL');
    assert.equal(outcome.canProceedToPayment, false);
    assert.equal(outcome.requiresHumanAction, true);
  });

  it('ESCALATES to REQUIRES_APPROVAL when AI detects intent mismatch or medium risk', () => {
    const mediumRiskAI: AIReviewResult = {
      ...safeAIReview,
      risk_level: 'MEDIUM',
      intent_match: false,
      recommendation: 'REQUIRE_HUMAN_REVIEW',
      explanation: 'Item category is borderline for stated user intent.',
    };
    const outcome = resolveTransactionDecision(passingPolicy, mediumRiskAI);
    assert.equal(outcome.status, 'REQUIRES_APPROVAL');
    assert.equal(outcome.requiresHumanAction, true);
    assert.ok(outcome.primaryReason.includes('ESCALATED TO HUMAN REVIEW'));
  });
});
