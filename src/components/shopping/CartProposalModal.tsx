'use client';

import React, { useState } from 'react';
import { ProductItem, Mandate } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import {
  X,
  Bot,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Lock,
  Zap,
  Brain,
  UserCheck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Building2,
  Tag,
} from 'lucide-react';
import { PayPalLogo } from '../common/PayPalLogo';
import { useRouter } from 'next/navigation';

interface CartProposalModalProps {
  product: ProductItem;
  mandates: Mandate[];
  onClose: () => void;
  onSuccess?: () => void;
}

// A single labeled decision layer row
const LayerRow = ({
  icon,
  label,
  value,
  detail,
  color = 'gray',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
  color?: 'green' | 'red' | 'amber' | 'blue' | 'gray';
}) => {
  const textColor = {
    green: 'text-[#0E8A44]',
    red: 'text-[#D92D20]',
    amber: 'text-[#B46500]',
    blue: 'text-[#0070E0]',
    gray: 'text-gray-700',
  }[color];

  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-[#F0F4F8] last:border-0">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] text-gray-500">{label}</span>
        <div className={`text-xs font-bold ${textColor}`}>{value}</div>
        {detail && <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </div>
  );
};

export const CartProposalModal: React.FC<CartProposalModalProps> = ({
  product,
  mandates,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const [selectedMandateId, setSelectedMandateId] = useState<string>(mandates[0]?.id || 'man-birthday-001');
  const [agentReasoning, setAgentReasoning] = useState<string>(
    product.flaggedRisk
      ? 'Adversarial prompt injection detected in this listing — submitting to MANDATE to demonstrate security enforcement.'
      : `Agent selected "${product.title}" based on photography gift intent. Verified merchant alignment and price within mandate budget parameters.`
  );
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPolicyChecks, setShowPolicyChecks] = useState(false);

  const selectedMandate = mandates.find((m) => m.id === selectedMandateId);

  const handleSubmitProposal = async () => {
    try {
      setEvaluating(true);
      setResult(null);
      const res = await fetch('/api/gateway/transactions/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandateId: selectedMandateId,
          agentId: 'agt-aura-001',
          product,
          amount: product.price,
          currency: product.currency,
          agentReasoning,
        }),
      });

      const data = await res.json();
      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(`Proposal error: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  const decision = result?.decision || result?.outcome?.status;
  const isApproved = decision === 'APPROVED';
  const isRequiresApproval = decision === 'REQUIRES_APPROVAL';
  const isBlocked = decision === 'BLOCKED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#DCE5EF] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F8] flex items-center justify-between bg-[#F8FAFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#142B4A]">Autonomous Transaction Proposal</h3>
              <p className="text-[11px] text-[#5E738B]">Agent submitting cart through the MANDATE Security Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-[#142B4A] max-h-[80vh] overflow-y-auto">

          {/* Pre-submit form */}
          {!result && (
            <>
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover border border-white shadow-sm flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#001C48] line-clamp-1">{product.title}</div>
                  <div className="flex items-center gap-2 text-gray-600 text-[11px] mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />{product.merchant}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />{product.category}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-[#003087] mt-1">
                    {formatCurrency(product.price, product.currency)}
                  </div>
                  {product.flaggedRisk && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#D92D20] bg-[#FEF3F2] px-2 py-0.5 rounded-md border border-[#F9A8A4] inline-flex">
                      <AlertTriangle className="w-3 h-3" />
                      ADVERSARIAL TEST LISTING — Demonstrates security enforcement
                    </div>
                  )}
                </div>
              </div>

              {/* Mandate Selection */}
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700">Authorizing Financial Mandate:</label>
                <select
                  value={selectedMandateId}
                  onChange={(e) => setSelectedMandateId(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs font-medium text-[#142B4A]"
                >
                  {mandates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — Budget: {formatCurrency(m.totalBudget, m.currency)} (Available: {formatCurrency(m.totalBudget - m.spentAmount - m.reservedAmount, m.currency)})
                    </option>
                  ))}
                </select>
                {selectedMandate && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedMandate.approvedMerchants.slice(0, 3).map(m => (
                      <span key={m} className="text-[10px] bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8] px-1.5 py-0.5 rounded font-medium">{m}</span>
                    ))}
                    {selectedMandate.approvedMerchants.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{selectedMandate.approvedMerchants.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Agent Reasoning */}
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#0070E0]" />
                  Autonomous Agent Reasoning:
                </label>
                <textarea
                  rows={2}
                  value={agentReasoning}
                  onChange={(e) => setAgentReasoning(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs text-gray-800 resize-none"
                />
              </div>

              {/* Dual-Layer Architecture Notice */}
              <div className="p-3.5 bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl text-[11px] text-[#003087]">
                <div className="font-bold mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  MANDATE Dual-Layer Security Architecture
                </div>
                <div className="space-y-1 text-[#1a3a6b]">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#003087]" />
                    <span><strong>Layer 1:</strong> Deterministic policy engine — pure math, zero AI influence</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Brain className="w-3 h-3 text-[#003087]" />
                    <span><strong>Layer 2:</strong> Gemini AI risk & prompt-injection reviewer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#003087]" />
                    <span>Agent holds <strong>zero</strong> payment credentials and cannot bypass this gateway.</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  onClick={handleSubmitProposal}
                  disabled={evaluating}
                  className="w-full py-3.5 bg-[#0070E0] hover:bg-[#005ea6] text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating via Deterministic Engine + Gemini AI Reviewer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Proposal to MANDATE Gateway</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Results — Full Explainability */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-200">

              {/* Prompt Injection Alert */}
              {result.transaction?.aiReview?.prompt_injection_detected && (
                <div className="bg-[#FEF3F2] border-2 border-[#D92D20] rounded-xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-[#D92D20] flex-shrink-0" />
                  <div>
                    <div className="font-extrabold text-sm text-[#D92D20] uppercase tracking-wide">
                      Adversarial Prompt Injection Neutralized
                    </div>
                    <p className="text-xs text-[#B42318] mt-1 leading-relaxed">
                      Product listing embedded instruction-override text. MANDATE detected the attack and blocked payment authorization without exposing PayPal credentials.
                    </p>
                  </div>
                </div>
              )}

              {/* Final Decision */}
              <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                isApproved
                  ? 'bg-[#F0FDF4] border-[#0E8A44] text-[#0E8A44]'
                  : isRequiresApproval
                  ? 'bg-[#FEF7EB] border-[#B46500] text-[#B46500]'
                  : 'bg-[#FEF3F2] border-[#D92D20] text-[#D92D20]'
              }`}>
                {isApproved && <CheckCircle2 className="w-7 h-7 flex-shrink-0" />}
                {isRequiresApproval && <AlertTriangle className="w-7 h-7 flex-shrink-0" />}
                {isBlocked && <ShieldAlert className="w-7 h-7 flex-shrink-0" />}

                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">
                    MANDATE Decision: {decision?.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {result.outcome?.primaryReason || result.transaction?.policyEvaluation?.explanation}
                  </p>
                  {isApproved && result.transaction?.paypalOrderId && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#003087]">
                      <CreditCard className="w-3.5 h-3.5" />
                      PayPal Sandbox Order: <span className="font-mono">{result.transaction.paypalOrderId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Explainability Breakdown — All 4 Layers */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-[#F8FAFD] border-b border-[#EEF3F8] flex items-center justify-between">
                  <span className="font-bold text-xs text-[#001C48]">Decision Explanation — Full Audit Trail</span>
                  <span className="text-[10px] text-gray-400 font-mono">Immutable Record</span>
                </div>
                <div className="p-4 divide-y divide-[#F0F4F8]">

                  {/* Layer 1: Deterministic Policy */}
                  <div className="pb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="w-3.5 h-3.5 text-[#003087]" />
                      <span className="text-[11px] font-extrabold text-[#003087] uppercase tracking-wide">Layer 1 — Deterministic Policy Engine</span>
                      <span className="text-[9px] text-gray-400">(Math-only, AI cannot override)</span>
                    </div>
                    <LayerRow
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
                      label="Policy Verdict"
                      value={result.transaction?.policyDecision || '—'}
                      color={result.transaction?.policyDecision === 'APPROVED_BY_POLICY' ? 'green' : result.transaction?.policyDecision === 'REQUIRES_HUMAN_APPROVAL' ? 'amber' : 'red'}
                    />
                    {result.transaction?.policyEvaluation?.detailedChecks?.map((check: any, i: number) => (
                      <LayerRow
                        key={i}
                        icon={check.passed
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8A44]" />
                          : <ShieldAlert className="w-3.5 h-3.5 text-[#D92D20]" />
                        }
                        label={check.ruleName}
                        value={check.passed ? 'PASSED' : 'FAILED'}
                        detail={check.message}
                        color={check.passed ? 'green' : 'red'}
                      />
                    ))}
                  </div>

                  {/* Layer 2: AI Reviewer */}
                  <div className="py-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Brain className="w-3.5 h-3.5 text-[#0070E0]" />
                      <span className="text-[11px] font-extrabold text-[#0070E0] uppercase tracking-wide">Layer 2 — AI Risk & Intent Reviewer (Gemini)</span>
                    </div>
                    {result.transaction?.aiReview ? (
                      <>
                        <LayerRow
                          icon={<Brain className="w-3.5 h-3.5" />}
                          label="Risk Level"
                          value={result.transaction.aiReview.risk_level || '—'}
                          color={result.transaction.aiReview.risk_level === 'LOW' ? 'green' : result.transaction.aiReview.risk_level === 'HIGH' ? 'red' : 'amber'}
                        />
                        <LayerRow
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          label="Intent Match"
                          value={result.transaction.aiReview.intent_match ? 'YES — Aligns with mandate purpose' : 'NO — Intent mismatch detected'}
                          color={result.transaction.aiReview.intent_match ? 'green' : 'red'}
                        />
                        <LayerRow
                          icon={<ShieldAlert className="w-3.5 h-3.5" />}
                          label="Prompt Injection"
                          value={result.transaction.aiReview.prompt_injection_detected ? '⚠ ATTACK DETECTED' : 'Not detected'}
                          color={result.transaction.aiReview.prompt_injection_detected ? 'red' : 'green'}
                        />
                        <LayerRow
                          icon={<Brain className="w-3.5 h-3.5" />}
                          label="AI Analysis"
                          value={result.transaction.aiReview.recommendation || '—'}
                          detail={result.transaction.aiReview.explanation}
                          color={result.transaction.aiReview.recommendation === 'ALLOW' ? 'green' : result.transaction.aiReview.recommendation === 'BLOCK' ? 'red' : 'amber'}
                        />
                      </>
                    ) : (
                      <p className="text-[11px] text-gray-500 italic">AI review not available (local heuristic fallback applied).</p>
                    )}
                  </div>

                  {/* Layer 3: Human Approval */}
                  <div className="py-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#B46500]" />
                      <span className="text-[11px] font-extrabold text-[#B46500] uppercase tracking-wide">Layer 3 — Human Financial Authorization</span>
                    </div>
                    <LayerRow
                      icon={<UserCheck className="w-3.5 h-3.5" />}
                      label="Approval Status"
                      value={isRequiresApproval
                        ? 'PENDING — Awaiting human sign-off in Approval Centre'
                        : result.transaction?.approvalStatus === 'APPROVED'
                        ? 'APPROVED by ' + (result.transaction?.approvedBy || 'Human Reviewer')
                        : 'Not required for this transaction'
                      }
                      color={isRequiresApproval ? 'amber' : result.transaction?.approvalStatus === 'APPROVED' ? 'green' : 'gray'}
                    />
                  </div>

                  {/* Layer 4: PayPal */}
                  <div className="pt-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CreditCard className="w-3.5 h-3.5 text-[#003087]" />
                      <span className="text-[11px] font-extrabold text-[#003087] uppercase tracking-wide">Layer 4 — PayPal Sandbox Payment</span>
                    </div>
                    {isApproved && result.transaction?.paypalOrderId ? (
                      <>
                        <LayerRow
                          icon={<CreditCard className="w-3.5 h-3.5" />}
                          label="PayPal Order"
                          value={result.transaction.paypalOrderId}
                          detail="Order created on PayPal Sandbox. Awaiting buyer approval at checkout."
                          color="blue"
                        />
                        {result.transaction?.paypalApprovalUrl && (
                          <div className="mt-2">
                            <a
                              href={result.transaction.paypalApprovalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#003087] hover:bg-[#001C48] px-3 py-1.5 rounded-lg transition"
                            >
                              <PayPalLogo height={14} variant="monogram" />
                              Complete Checkout in PayPal Sandbox
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <p className="text-[10px] text-gray-400 mt-1">Opens PayPal Sandbox — log in as buyer sb-47eyng53682632@personal.example.com</p>
                          </div>
                        )}
                      </>
                    ) : isBlocked ? (
                      <LayerRow
                        icon={<ShieldAlert className="w-3.5 h-3.5" />}
                        label="PayPal Status"
                        value="BLOCKED — No PayPal order was created"
                        detail="MANDATE enforced the policy boundary. PayPal was never contacted."
                        color="red"
                      />
                    ) : isRequiresApproval ? (
                      <LayerRow
                        icon={<Lock className="w-3.5 h-3.5" />}
                        label="PayPal Status"
                        value="PENDING HUMAN APPROVAL — PayPal order not yet created"
                        detail="A PayPal Sandbox order will only be created after the human reviewer approves this exception."
                        color="amber"
                      />
                    ) : (
                      <p className="text-[11px] text-gray-500 italic">No PayPal order generated.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={() => router.push('/ledger')}
                  className="flex-1 py-2.5 px-3 bg-[#003087] hover:bg-[#001C48] text-white font-semibold rounded-xl text-center text-xs transition"
                >
                  View in Security Audit Ledger
                </button>

                {isRequiresApproval && (
                  <button
                    onClick={() => router.push('/approvals')}
                    className="flex-1 py-2.5 px-3 bg-[#0070E0] hover:bg-[#005ea6] text-white font-semibold rounded-xl text-center text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Open Human Approval Centre
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-white border border-[#DCE5EF] text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
