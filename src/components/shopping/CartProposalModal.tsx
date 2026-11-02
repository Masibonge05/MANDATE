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
} from 'lucide-react';
import { PayPalLogo } from '../common/PayPalLogo';
import { useRouter } from 'next/navigation';

interface CartProposalModalProps {
  product: ProductItem;
  mandates: Mandate[];
  onClose: () => void;
  onSuccess?: () => void;
}

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
      ? 'Adversarial attempt trying to exploit automated purchasing constraints.'
      : `Agent selected "${product.title}" based on sister's passion for photography. Verified merchant and price alignment.`
  );
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedMandate = mandates.find((m) => m.id === selectedMandateId);

  const handleSubmitProposal = async () => {
    try {
      setEvaluating(true);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-modal border border-[#DCE5EF] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F8] flex items-center justify-between bg-[#F8FAFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#142B4A]">Autonomous Transaction Proposal</h3>
              <p className="text-xs text-[#5E738B]">Agent submitting cart through the MANDATE Security Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-[#142B4A]">
          {!result && (
            <>
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-16 h-16 rounded-lg object-cover border border-white"
                />
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#001C48] line-clamp-1">{product.title}</div>
                  <div className="text-gray-600 text-xs mt-0.5">
                    Merchant: <strong className="text-gray-900">{product.merchant}</strong> • Category: {product.category}
                  </div>
                  <div className="text-base font-extrabold text-[#003087] mt-1">
                    {formatCurrency(product.price, product.currency)}
                  </div>
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
              </div>

              {/* Agent Reasoning */}
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700">Autonomous Agent Reasoning:</label>
                <textarea
                  rows={3}
                  value={agentReasoning}
                  onChange={(e) => setAgentReasoning(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs text-gray-800"
                />
              </div>

              {/* Core Security Notice */}
              <div className="p-3 bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl text-[11px] text-[#003087] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  The agent does not possess payment credentials. This action will submit a proposal to MANDATE for mathematical verification and AI security inspection.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmitProposal}
                  disabled={evaluating}
                  className="w-full py-3 bg-[#0070E0] hover:bg-[#005ea6] text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating through Deterministic Policy Engine & AI Reviewer...</span>
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

          {result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Decision Result Badge */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                result.decision === 'APPROVED'
                  ? 'bg-[#EBF8F0] border-[#A6E3B8] text-[#0E8A44]'
                  : result.decision === 'REQUIRES_APPROVAL'
                  ? 'bg-[#FEF7EB] border-[#F8D8A3] text-[#B46500]'
                  : 'bg-[#FEF3F2] border-[#F9A8A4] text-[#D92D20]'
              }`}>
                {result.decision === 'APPROVED' && <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
                {result.decision === 'REQUIRES_APPROVAL' && <AlertTriangle className="w-6 h-6 flex-shrink-0" />}
                {result.decision === 'BLOCKED' && <ShieldAlert className="w-6 h-6 flex-shrink-0" />}

                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">
                    Gateway Decision: {result.decision.replace('_', ' ')}
                  </h4>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {result.outcome?.primaryReason || result.transaction?.policyEvaluation?.explanation}
                  </p>
                </div>
              </div>

              {/* Layer breakdown preview */}
              <div className="bg-[#F8FAFD] border border-[#E2E8F0] p-3 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Deterministic Engine:</span>
                  <span className="font-bold text-gray-900">{result.transaction?.policyDecision}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI Risk Assessment:</span>
                  <span className="font-bold text-gray-900">{result.transaction?.aiReview?.risk_level}</span>
                </div>
                {result.transaction?.aiReview?.prompt_injection_detected && (
                  <div className="text-[#D92D20] font-bold text-[11px] bg-[#FEF3F2] p-1.5 rounded">
                    🚨 Prompt Injection Attempt Neutralized
                  </div>
                )}
              </div>

              {/* Navigation Options */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => router.push('/ledger')}
                  className="flex-1 py-2.5 px-3 bg-[#003087] hover:bg-[#001C48] text-white font-semibold rounded-xl text-center text-xs transition"
                >
                  View in Security Audit Ledger
                </button>

                {result.decision === 'REQUIRES_APPROVAL' && (
                  <button
                    onClick={() => router.push('/approvals')}
                    className="flex-1 py-2.5 px-3 bg-[#0070E0] hover:bg-[#005ea6] text-white font-semibold rounded-xl text-center text-xs transition"
                  >
                    Open Human Approval Centre →
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

