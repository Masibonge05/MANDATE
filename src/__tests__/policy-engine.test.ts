import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy, toCents, fromCents } from '../lib/policy-engine.ts';
import type { Mandate } from '../lib/types.ts';

const baseMandate: Mandate = {
  id: 'man-test-01',
  userId: 'usr-01',
  name: 'Photography Gift Mandate',
  description: 'Gifts for sister, budget $100',
  currency: 'USD',
  totalBudget: 100.00,
  spentAmount: 0.00,
  reservedAmount: 0.00,
  maxTransactionAmount: 100.00,
  maxQuantityPerPurchase: 1,
  allowedCategories: ['Photography Accessories', 'Bags & Straps'],
  restrictedCategories: ['Adult Entertainment', 'Cryptocurrency'],
  approvedMerchants: ['Apex Optics', 'B&H Photo Video', 'Peak Design'],
  blockedMerchants: ['ShadyReseller Store', 'RogueCamera Deals'],
  allowUnknownMerchants: false,
  requiresHumanApproval: false,
  approvalThreshold: 60.00,
  approvalRequiredCategories: ['Electronics'],
  expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(),
  status: 'active',
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('MANDATE Deterministic Policy Engine', () => {
  it('approves a compliant purchase within budget and whitelist', () => {
    const result = evaluatePolicy({
      mandate: baseMandate,
      amount: 45.00,
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'Apex Optics',
      productTitle: 'Lens Filter Kit',
    });

    assert.equal(result.decision, 'APPROVED_BY_POLICY');
    assert.equal(result.checks.mandate_active, true);
    assert.equal(result.checks.budget_available, true);
    assert.equal(result.checks.amount_within_tx_limit, true);
    assert.equal(result.checks.merchant_valid, true);
    assert.equal(result.checks.category_valid, true);
  });

  it('blocks a transaction exceeding the maximum single transaction limit', () => {
    const mandateWithStrictLimit: Mandate = {
      ...baseMandate,
      maxTransactionAmount: 40.00,
    };

    const result = evaluatePolicy({
      mandate: mandateWithStrictLimit,
      amount: 45.00,
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'Apex Optics',
      productTitle: 'Lens Filter Kit',
    });

    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reasonCodes.includes('AMOUNT_EXCEEDS_TRANSACTION_LIMIT'));
  });

  it('blocks a purchase from an unapproved merchant when unknown merchants are forbidden', () => {
    const result = evaluatePolicy({
      mandate: baseMandate,
      amount: 30.00,
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'RandomWebStore',
      productTitle: 'Mini Tripod',
    });

    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reasonCodes.includes('MERCHANT_NOT_APPROVED'));
  });

  it('blocks a purchase from an explicitly blocked merchant', () => {
    const result = evaluatePolicy({
      mandate: baseMandate,
      amount: 30.00,
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'ShadyReseller Store',
      productTitle: 'Cheap Lens',
    });

    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reasonCodes.includes('MERCHANT_EXPLICITLY_BLOCKED'));
  });

  it('blocks a transaction exceeding remaining budget considering spent and reserved funds', () => {
    const almostExhaustedMandate: Mandate = {
      ...baseMandate,
      totalBudget: 100.00,
      spentAmount: 70.00,
      reservedAmount: 20.00, // Available: $10.00
    };

    const result = evaluatePolicy({
      mandate: almostExhaustedMandate,
      amount: 15.00, // Exceeds $10 available
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'Apex Optics',
      productTitle: 'Cleaning Cloth',
    });

    assert.equal(result.decision, 'BLOCKED');
    assert.ok(result.reasonCodes.includes('INSUFFICIENT_MANDATE_BUDGET'));
  });

  it('requires human approval when product matches an approval-required category', () => {
    const result = evaluatePolicy({
      mandate: baseMandate,
      amount: 45.00,
      currency: 'USD',
      quantity: 1,
      productCategory: 'Electronics',
      merchant: 'Apex Optics',
      productTitle: 'Photo Printer',
    });

    assert.equal(result.decision, 'REQUIRES_HUMAN_APPROVAL');
    assert.ok(result.reasonCodes.some(r => r.startsWith('CATEGORY_REQUIRES_APPROVAL')));
  });

  it('requires human approval when amount reaches or exceeds approval threshold', () => {
    const result = evaluatePolicy({
      mandate: baseMandate,
      amount: 65.00, // Threshold is $60.00
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'Apex Optics',
      productTitle: 'Studio Light',
    });

    assert.equal(result.decision, 'REQUIRES_HUMAN_APPROVAL');
    assert.ok(result.reasonCodes.includes('AMOUNT_EXCEEDS_APPROVAL_THRESHOLD'));
  });

  it('blocks transactions on an expired or paused mandate', () => {
    const pausedMandate: Mandate = { ...baseMandate, status: 'paused' };
    const pausedResult = evaluatePolicy({
      mandate: pausedMandate,
      amount: 20.00,
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'Apex Optics',
      productTitle: 'Filter',
    });
    assert.equal(pausedResult.decision, 'BLOCKED');

    const expiredMandate: Mandate = {
      ...baseMandate,
      expiryDate: new Date(Date.now() - 10000).toISOString(),
    };
    const expiredResult = evaluatePolicy({
      mandate: expiredMandate,
      amount: 20.00,
      currency: 'USD',
      quantity: 1,
      productCategory: 'Photography Accessories',
      merchant: 'Apex Optics',
      productTitle: 'Filter',
    });
    assert.equal(expiredResult.decision, 'BLOCKED');
    assert.ok(expiredResult.reasonCodes.includes('MANDATE_EXPIRED'));
  });

  it('accurately converts cents without floating point drift', () => {
    assert.equal(toCents(19.99), 1999);
    assert.equal(fromCents(1999), 19.99);
    assert.equal(toCents(0.1) + toCents(0.2), 30);
    assert.equal(fromCents(30), 0.3);
  });
});
