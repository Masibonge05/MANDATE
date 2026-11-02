/**
 * MANDATE - Deterministic Policy Enforcement Engine
 * Pure deterministic TypeScript rules engine.
 * Financial decisions are ALWAYS executed via strict mathematical checks.
 * LLMs are NEVER allowed to calculate, relax, or override spending policies.
 */

import type { Mandate, PolicyDecision, PolicyEvaluation, PolicyCheckResult, Currency } from './types.ts';

export interface ProposedTransactionParams {
  mandate: Mandate;
  amount: number;
  currency: Currency;
  quantity: number;
  productCategory: string;
  merchant: string;
  productTitle: string;
  isDuplicate?: boolean;
}

// Convert monetary values to integer cents to guarantee decimal precision
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function evaluatePolicy(params: ProposedTransactionParams): PolicyEvaluation {
  const {
    mandate,
    amount,
    currency,
    quantity,
    productCategory,
    merchant,
    productTitle,
    isDuplicate = false,
  } = params;

  const checks: Record<string, boolean> = {};
  const detailedChecks: PolicyCheckResult[] = [];
  const reasonCodes: string[] = [];
  let isBlocked = false;
  let isInvalid = false;
  let requiresApproval = false;

  // 1. Duplicate submission check
  if (isDuplicate) {
    reasonCodes.push('DUPLICATE_IDEMPOTENCY_KEY');
    return {
      decision: 'DUPLICATE',
      reasonCodes,
      checks: { idempotency_unique: false },
      detailedChecks: [{
        ruleName: 'Idempotency Verification',
        passed: false,
        message: 'This transaction proposal has already been evaluated or processed.',
        isMandatory: true,
        severity: 'CRITICAL',
      }],
      explanation: 'Duplicate transaction proposal detected via idempotency key.',
    };
  }

  // 2. Required transaction details completeness check
  const hasRequiredFields = 
    Boolean(productTitle && productTitle.trim()) &&
    Boolean(merchant && merchant.trim()) &&
    amount > 0 &&
    quantity >= 1;

  checks.required_fields_present = hasRequiredFields;
  detailedChecks.push({
    ruleName: 'Payload Completeness',
    passed: hasRequiredFields,
    message: hasRequiredFields 
      ? 'All required product, merchant, and pricing fields are present.' 
      : 'Missing required transaction fields (title, merchant, quantity, or valid amount).',
    isMandatory: true,
    severity: 'CRITICAL',
  });

  if (!hasRequiredFields) {
    reasonCodes.push('INVALID_TRANSACTION_PAYLOAD');
    isInvalid = true;
  }

  // 3. Mandate Active Status Check
  const isMandateActive = mandate.status === 'active';
  checks.mandate_active = isMandateActive;
  detailedChecks.push({
    ruleName: 'Mandate Active Status',
    passed: isMandateActive,
    message: isMandateActive 
      ? `Mandate "${mandate.name}" is currently active.` 
      : `Mandate "${mandate.name}" is not active (current status: ${mandate.status.toUpperCase()}).`,
    isMandatory: true,
    severity: 'CRITICAL',
  });

  if (!isMandateActive) {
    reasonCodes.push(`MANDATE_${mandate.status.toUpperCase()}`);
    isBlocked = true;
  }

  // 4. Mandate Expiry Check
  const now = new Date();
  const expiry = new Date(mandate.expiryDate);
  const isNotExpired = now <= expiry;
  checks.mandate_not_expired = isNotExpired;
  detailedChecks.push({
    ruleName: 'Mandate Validity Period',
    passed: isNotExpired,
    message: isNotExpired 
      ? `Mandate is valid until ${expiry.toISOString().split('T')[0]}.` 
      : `Mandate expired on ${expiry.toISOString().split('T')[0]}.`,
    isMandatory: true,
    severity: 'CRITICAL',
  });

  if (!isNotExpired) {
    reasonCodes.push('MANDATE_EXPIRED');
    isBlocked = true;
  }

  // 5. Currency Consistency Check
  const isCurrencyMatching = currency.toUpperCase() === mandate.currency.toUpperCase();
  checks.currency_consistent = isCurrencyMatching;
  detailedChecks.push({
    ruleName: 'Currency Consistency',
    passed: isCurrencyMatching,
    message: isCurrencyMatching 
      ? `Transaction currency (${currency}) matches mandate currency (${mandate.currency}).` 
      : `Currency mismatch: transaction requested in ${currency}, but mandate requires ${mandate.currency}.`,
    isMandatory: true,
    severity: 'CRITICAL',
  });

  if (!isCurrencyMatching) {
    reasonCodes.push('CURRENCY_MISMATCH');
    isBlocked = true;
  }

  // 6. Max Individual Transaction Limit Check (Decimal Safe in Cents)
  const amountCents = toCents(amount);
  const maxTxCents = toCents(mandate.maxTransactionAmount);
  const isWithinTxLimit = amountCents <= maxTxCents;
  checks.amount_within_tx_limit = isWithinTxLimit;
  detailedChecks.push({
    ruleName: 'Single Transaction Limit',
    passed: isWithinTxLimit,
    message: isWithinTxLimit 
      ? `Proposed amount $${amount.toFixed(2)} is within maximum transaction limit ($${mandate.maxTransactionAmount.toFixed(2)}).` 
      : `Amount $${amount.toFixed(2)} exceeds maximum single transaction limit of $${mandate.maxTransactionAmount.toFixed(2)}.`,
    isMandatory: true,
    severity: 'CRITICAL',
  });

  if (!isWithinTxLimit) {
    reasonCodes.push('AMOUNT_EXCEEDS_TRANSACTION_LIMIT');
    isBlocked = true;
  }

  // 7. Remaining Budget Availability Check (Decimal Safe in Cents)
  const totalBudgetCents = toCents(mandate.totalBudget);
  const spentCents = toCents(mandate.spentAmount);
  const reservedCents = toCents(mandate.reservedAmount);
  const availableBudgetCents = Math.max(0, totalBudgetCents - spentCents - reservedCents);
  const isBudgetAvailable = amountCents <= availableBudgetCents;
  checks.budget_available = isBudgetAvailable;
  detailedChecks.push({
    ruleName: 'Remaining Budget Verification',
    passed: isBudgetAvailable,
    message: isBudgetAvailable 
      ? `Available budget is $${fromCents(availableBudgetCents).toFixed(2)} (Spent: $${mandate.spentAmount.toFixed(2)}, Reserved: $${mandate.reservedAmount.toFixed(2)}).` 
      : `Insufficient remaining budget: $${fromCents(availableBudgetCents).toFixed(2)} available, but $${amount.toFixed(2)} requested.`,
    isMandatory: true,
    severity: 'CRITICAL',
  });

  if (!isBudgetAvailable) {
    reasonCodes.push('INSUFFICIENT_MANDATE_BUDGET');
    isBlocked = true;
  }

  // 8. Max Quantity Per Purchase Check
  const isQuantityValid = quantity <= mandate.maxQuantityPerPurchase;
  checks.quantity_valid = isQuantityValid;
  detailedChecks.push({
    ruleName: 'Purchase Quantity Limit',
    passed: isQuantityValid,
    message: isQuantityValid 
      ? `Quantity (${quantity}) is within limit of ${mandate.maxQuantityPerPurchase} unit(s).` 
      : `Quantity (${quantity}) exceeds allowed limit of ${mandate.maxQuantityPerPurchase} unit(s).`,
    isMandatory: true,
    severity: 'CRITICAL',
  });

  if (!isQuantityValid) {
    reasonCodes.push('QUANTITY_LIMIT_EXCEEDED');
    isBlocked = true;
  }

  // 9. Merchant Whitelist & Blocklist Evaluation
  const cleanMerchant = merchant.trim().toLowerCase();
  const isBlockedMerchant = mandate.blockedMerchants.some(
    m => m.trim().toLowerCase() === cleanMerchant
  );

  const isApprovedMerchant = mandate.approvedMerchants.some(
    m => m.trim().toLowerCase() === cleanMerchant
  );

  const merchantValid = !isBlockedMerchant && (mandate.allowUnknownMerchants || isApprovedMerchant);
  checks.merchant_valid = merchantValid;

  if (isBlockedMerchant) {
    detailedChecks.push({
      ruleName: 'Merchant Restriction',
      passed: false,
      message: `Merchant "${merchant}" is on the mandate's explicitly blocked merchants list.`,
      isMandatory: true,
      severity: 'CRITICAL',
    });
    reasonCodes.push('MERCHANT_EXPLICITLY_BLOCKED');
    isBlocked = true;
  } else if (!isApprovedMerchant && !mandate.allowUnknownMerchants) {
    detailedChecks.push({
      ruleName: 'Merchant Approval Check',
      passed: false,
      message: `Merchant "${merchant}" is not in the approved merchant whitelist and unknown merchants are disallowed.`,
      isMandatory: true,
      severity: 'CRITICAL',
    });
    reasonCodes.push('MERCHANT_NOT_APPROVED');
    isBlocked = true;
  } else {
    detailedChecks.push({
      ruleName: 'Merchant Evaluation',
      passed: true,
      message: `Merchant "${merchant}" is approved for this mandate.`,
      isMandatory: true,
      severity: 'INFO',
    });
  }

  // 10. Category Whitelist & Restricted Evaluation
  const cleanCategory = productCategory.trim().toLowerCase();
  const isRestrictedCategory = mandate.restrictedCategories.some(
    c => c.trim().toLowerCase() === cleanCategory
  );

  const isAllowedCategory = 
    mandate.allowedCategories.length === 0 ||
    mandate.allowedCategories.some(
      c => c.trim().toLowerCase() === cleanCategory || cleanCategory.includes(c.trim().toLowerCase())
    ) ||
    mandate.approvalRequiredCategories.some(
      c => c.trim().toLowerCase() === cleanCategory || cleanCategory.includes(c.trim().toLowerCase())
    );

  const categoryValid = !isRestrictedCategory && isAllowedCategory;
  checks.category_valid = categoryValid;

  if (isRestrictedCategory) {
    detailedChecks.push({
      ruleName: 'Category Restriction',
      passed: false,
      message: `Product category "${productCategory}" is explicitly restricted by mandate policy.`,
      isMandatory: true,
      severity: 'CRITICAL',
    });
    reasonCodes.push('CATEGORY_RESTRICTED');
    isBlocked = true;
  } else if (!isAllowedCategory) {
    detailedChecks.push({
      ruleName: 'Category Whitelist Check',
      passed: false,
      message: `Product category "${productCategory}" is not in the mandate's approved category list.`,
      isMandatory: true,
      severity: 'CRITICAL',
    });
    reasonCodes.push('CATEGORY_NOT_ALLOWED');
    isBlocked = true;
  } else {
    detailedChecks.push({
      ruleName: 'Category Evaluation',
      passed: true,
      message: `Product category "${productCategory}" is authorized.`,
      isMandatory: true,
      severity: 'INFO',
    });
  }

  // 11. Human Approval Requirements Check (Exceptions Workflow)
  // Check if mandate requires unconditional approval, or approval threshold exceeded, or special category
  const isApprovalCategory = mandate.approvalRequiredCategories.some(
    c => c.trim().toLowerCase() === cleanCategory || cleanCategory.includes(c.trim().toLowerCase())
  );

  const exceedsApprovalThreshold = 
    mandate.approvalThreshold > 0 && 
    amountCents >= toCents(mandate.approvalThreshold);

  const mandateDemandsApproval = mandate.requiresHumanApproval;

  if (!isBlocked && !isInvalid) {
    if (mandateDemandsApproval) {
      requiresApproval = true;
      reasonCodes.push('MANDATE_REQUIRES_HUMAN_APPROVAL');
      detailedChecks.push({
        ruleName: 'Human Approval Trigger (Mandate Policy)',
        passed: true,
        message: 'This mandate specifies that all transactions require explicit human sign-off.',
        isMandatory: false,
        severity: 'WARNING',
      });
    }

    if (isApprovalCategory) {
      requiresApproval = true;
      reasonCodes.push(`CATEGORY_REQUIRES_APPROVAL:${productCategory}`);
      detailedChecks.push({
        ruleName: 'Human Approval Trigger (Category)',
        passed: true,
        message: `Category "${productCategory}" matches mandate requirement for explicit human exception approval.`,
        isMandatory: false,
        severity: 'WARNING',
      });
    }

    if (exceedsApprovalThreshold) {
      requiresApproval = true;
      reasonCodes.push('AMOUNT_EXCEEDS_APPROVAL_THRESHOLD');
      detailedChecks.push({
        ruleName: 'Human Approval Trigger (Threshold)',
        passed: true,
        message: `Transaction amount $${amount.toFixed(2)} reaches or exceeds the review threshold ($${mandate.approvalThreshold.toFixed(2)}).`,
        isMandatory: false,
        severity: 'WARNING',
      });
    }
  }

  // Final Deterministic Decision Resolution
  let decision: PolicyDecision;
  let explanation: string;

  if (isInvalid) {
    decision = 'INVALID';
    explanation = 'Transaction proposal payload is incomplete or invalid.';
  } else if (isBlocked) {
    decision = 'BLOCKED';
    explanation = `Transaction rejected by deterministic policy rules: ${reasonCodes.join(', ')}.`;
  } else if (requiresApproval) {
    decision = 'REQUIRES_HUMAN_APPROVAL';
    explanation = `Deterministic policy checks passed, but mandate rules require explicit human approval before payment authorization.`;
  } else {
    decision = 'APPROVED_BY_POLICY';
    explanation = 'All deterministic policy rules satisfied (budget, merchant, category, limits).';
  }

  return {
    decision,
    reasonCodes,
    checks,
    detailedChecks,
    explanation,
  };
}
