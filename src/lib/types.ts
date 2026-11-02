/**
 * MANDATE - Core Type Definitions
 * Strict types for financial policies, AI reviews, transactions, and audit logs.
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD';

export type MandateStatus = 'active' | 'paused' | 'expired' | 'revoked';

export type PolicyDecision = 
  | 'APPROVED_BY_POLICY' 
  | 'REQUIRES_HUMAN_APPROVAL' 
  | 'BLOCKED' 
  | 'INVALID' 
  | 'DUPLICATE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TransactionLifecycleStatus = 
  | 'PROPOSED'
  | 'UNDER_REVIEW'
  | 'BLOCKED'
  | 'REQUIRES_APPROVAL'
  | 'APPROVED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'NOT_REQUIRED';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  businessName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Mandate {
  id: string;
  userId: string;
  name: string;
  description: string;
  rawPrompt?: string;
  currency: Currency;
  totalBudget: number; // Stored in cents / decimal representation ($100.00 = 100)
  spentAmount: number;
  reservedAmount: number; // In-flight pending approvals / captures
  maxTransactionAmount: number;
  maxQuantityPerPurchase: number;
  allowedCategories: string[];
  restrictedCategories: string[];
  approvedMerchants: string[];
  blockedMerchants: string[];
  allowUnknownMerchants: boolean;
  requiresHumanApproval: boolean;
  approvalThreshold: number; // Above this amount requires approval
  approvalRequiredCategories: string[]; // e.g. ["electronics", "digital_goods"]
  expiryDate: string; // ISO string
  status: MandateStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface MandateVersion {
  id: string;
  mandateId: string;
  version: number;
  changesSummary: string;
  snapshot: Partial<Mandate>;
  createdAt: string;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  type: string; // e.g. 'shopping', 'procurement', 'travel'
  description: string;
  apiKeyPrefix: string;
  status: 'active' | 'revoked';
  assignedMandateIds: string[];
  rateLimitPerMinute: number;
  totalProposals: number;
  lastActiveAt: string;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  merchant: string;
  category: string;
  imageUrl: string;
  productUrl: string;
  inStock: boolean;
  rating?: number;
  attributes?: Record<string, string>;
  isSampleData: boolean;
  flaggedRisk?: boolean; // For demo/testing malicious injection scenarios
}

export interface PolicyCheckResult {
  ruleName: string;
  passed: boolean;
  message: string;
  isMandatory: boolean;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface PolicyEvaluation {
  decision: PolicyDecision;
  reasonCodes: string[];
  checks: Record<string, boolean>;
  detailedChecks: PolicyCheckResult[];
  explanation: string;
}

export interface AIReviewResult {
  risk_level: RiskLevel;
  intent_match: boolean;
  prompt_injection_detected: boolean;
  price_anomaly: boolean;
  merchant_concern: boolean;
  explanation: string;
  recommendation: 'ALLOW' | 'REQUIRE_HUMAN_REVIEW' | 'BLOCK';
  analyzedAt: string;
  modelUsed: string;
}

export interface Transaction {
  id: string;
  idempotencyKey: string;
  userId: string;
  agentId: string;
  agentName: string;
  mandateId: string;
  mandateName: string;
  mandateVersion: number;
  product: {
    id: string;
    title: string;
    merchant: string;
    category: string;
    price: number;
    currency: Currency;
    quantity: number;
    imageUrl: string;
    source: string;
  };
  amount: number;
  currency: Currency;
  agentReasoning: string;
  policyDecision: PolicyDecision;
  policyEvaluation: PolicyEvaluation;
  aiReview: AIReviewResult;
  status: TransactionLifecycleStatus;
  approvalStatus: ApprovalStatus;
  approvalReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalPaymentStatus?: string;
  paypalApprovalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  transactionId?: string;
  mandateId?: string;
  userId: string;
  agentId?: string;
  eventType: 
    | 'MANDATE_CREATED'
    | 'MANDATE_UPDATED'
    | 'MANDATE_PAUSED'
    | 'MANDATE_RESUMED'
    | 'MANDATE_REVOKED'
    | 'TRANSACTION_PROPOSED'
    | 'POLICY_EVALUATED'
    | 'AI_REVIEW_COMPLETED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVAL_GRANTED'
    | 'APPROVAL_REJECTED'
    | 'PAYPAL_ORDER_CREATED'
    | 'PAYPAL_ORDER_APPROVED'
    | 'PAYPAL_PAYMENT_CAPTURED'
    | 'PAYPAL_PAYMENT_FAILED'
    | 'TRANSACTION_BLOCKED';
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface SystemAnalytics {
  totalProposals: number;
  approvedCount: number;
  blockedCount: number;
  pendingApprovalCount: number;
  paidCount: number;
  totalAuthorizedSpending: number;
  totalBlockedSpending: number;
  activeMandatesCount: number;
  connectedAgentsCount: number;
  promptInjectionsBlocked: number;
  approvalRate: number; // percentage
  blockRate: number; // percentage
}

