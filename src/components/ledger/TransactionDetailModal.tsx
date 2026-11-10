'use client';

import React, { useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, getStatusBadgeStyle, getRiskBadgeStyle } from '@/lib/formatters';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Bot,
  Building2,
  Calendar,
  ExternalLink,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { PayPalLogo } from '../common/PayPalLogo';
import { PayPalCheckoutModal } from '../paypal/PayPalCheckoutModal';

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
  onRefresh?: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onRefresh,
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const statusStyle = getStatusBadgeStyle(transaction.status);
  const riskStyle = getRiskBadgeStyle(transaction.aiReview?.risk_level || 'LOW');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-modal border border-[#DCE5EF] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F8] flex items-center justify-between bg-[#F8FAFD]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#003087]/10 flex items-center justify-center text-[#003087]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#142B4A] text-base">Audit Record: {transaction.id}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
              </div>
              <p className="text-xs text-[#5E738B]">
                Recorded {formatDate(transaction.createdAt)} • Idempotency: {transaction.idempotencyKey.substring(0, 16)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#142B4A]">
          {/* Prompt Injection Alert Banner if detected */}
          {transaction.aiReview?.prompt_injection_detected && (
            <div className="bg-[#FEF3F2] border border-[#F9A8A4] rounded-xl p-4 text-[#D92D20] space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>ADVERSARIAL PROMPT INJECTION DETECTED</span>
              </div>
              <p className="text-xs leading-relaxed text-[#B42318]">
                Untrusted product listing attempted to override mandate security constraints. The MANDATE gateway halted execution and blocked payment authorization.
              </p>
            </div>
          )}

          {/* Product & Financial Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8FAFD] p-4 rounded-xl border border-[#E2E8F0]">
            <div className="md:col-span-2 space-y-2">
              <div className="text-[11px] font-semibold text-[#5E738B] uppercase tracking-wider">
                Proposed Product Details
              </div>
              <div className="font-bold text-sm text-[#001C48]">{transaction.product.title}</div>
              <div className="flex flex-wrap items-center gap-3 text-gray-600">
                <span className="flex items-center gap-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-[#5E738B]" />
                  Merchant: {transaction.product.merchant}
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#DCE5EF] rounded font-medium text-[11px]">
                  {transaction.product.category}
                </span>
                <span className="text-gray-500">Qty: {transaction.product.quantity}</span>
                <span className="flex items-center gap-1 font-semibold text-[#003087] bg-[#EBF3FC] px-2 py-0.5 rounded border border-[#CDE1F8] text-[11px]">
                  Policy: {transaction.mandateName} (v{transaction.mandateVersion || 1}.0)
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-[#DCE5EF] md:pl-4 pt-3 md:pt-0">
              <span className="text-[11px] text-[#5E738B] font-medium">Proposed Amount</span>
              <span className="text-2xl font-extrabold text-[#003087]">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
              <span className="text-[10px] text-gray-500">Currency: {transaction.currency}</span>
            </div>
          </div>

          {/* Agent Reasoning */}
          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 font-semibold text-[#003087]">
              <Bot className="w-4 h-4 text-[#0070E0]" />
              <span>Initiating Agent: {transaction.agentName}</span>
            </div>
            <p className="text-gray-700 italic bg-[#F5F8FC] p-2.5 rounded-lg border border-[#EEF3F8]">
              "{transaction.agentReasoning}"
            </p>
          </div>

          {/* Layer 1: Deterministic Policy Engine Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#003087]" />
                <h4 className="font-bold text-sm text-[#001C48]">
                  Layer 1: Deterministic Policy Engine
                </h4>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#003087] bg-[#EBF3FC] px-2 py-0.5 rounded">
                {transaction.policyDecision}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {transaction.policyEvaluation?.detailedChecks?.map((chk, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    chk.passed
                      ? 'bg-[#EBF8F0]/40 border-[#A6E3B8]/60 text-gray-800'
                      : 'bg-[#FEF3F2]/40 border-[#F9A8A4]/60 text-gray-800'
                  }`}
                >
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0E8A44] flex-shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-[#D92D20] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>{chk.ruleName}</span>
                      <span className={`text-[9px] px-1 rounded font-bold ${chk.passed ? 'bg-[#EBF8F0] text-[#0E8A44]' : 'bg-[#FEF3F2] text-[#D92D20]'}`}>
                        {chk.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-tight">{chk.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layer 2: AI Transaction Risk Review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0070E0]" />
                <h4 className="font-bold text-sm text-[#001C48]">
                  Layer 2: AI Risk & Intent Reviewer
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${riskStyle.bg} ${riskStyle.text}`}>
                  RISK: {transaction.aiReview?.risk_level}
                </span>
              </div>
            </div>

            <div className="bg-[#F8FAFD] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded border border-[#EEF3F8]">
                  <span className="text-gray-500 block">Intent Alignment:</span>
                  <span className={`font-bold ${transaction.aiReview?.intent_match ? 'text-[#0E8A44]' : 'text-[#D92D20]'}`}>
                    {transaction.aiReview?.intent_match ? 'Matched' : 'Mismatch'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-[#EEF3F8]">
                  <span className="text-gray-500 block">Prompt Injection:</span>
                  <span className={`font-bold ${transaction.aiReview?.prompt_injection_detected ? 'text-[#D92D20]' : 'text-[#0E8A44]'}`}>
                    {transaction.aiReview?.prompt_injection_detected ? 'DETECTED' : 'Clean'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-[#EEF3F8]">
                  <span className="text-gray-500 block">Price Anomaly:</span>
                  <span className={`font-bold ${transaction.aiReview?.price_anomaly ? 'text-[#B46500]' : 'text-[#0E8A44]'}`}>
                    {transaction.aiReview?.price_anomaly ? 'Flagged' : 'Normal'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-[#EEF3F8]">
                  <span className="text-gray-500 block">Recommendation:</span>
                  <span className="font-bold text-[#003087]">
                    {transaction.aiReview?.recommendation}
                  </span>
                </div>
              </div>

              <div className="text-gray-700 bg-white p-2.5 rounded border border-[#EEF3F8]">
                <span className="font-semibold text-gray-900 block mb-0.5">AI Security Findings:</span>
                {transaction.aiReview?.explanation}
              </div>
            </div>
          </div>

          {/* PayPal Payment Reference Section */}
          <div className="p-4 rounded-xl border border-[#003087]/20 bg-[#F5F8FC] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PayPalLogo variant="full" height={18} />
                <span className="font-bold text-xs text-[#003087]">Payment Lifecycle Integration</span>
              </div>
              <span className="text-[10px] bg-[#EBF3FC] text-[#0070E0] font-semibold px-2 py-0.5 rounded border border-[#CDE1F8]">
                Sandbox Environment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="bg-white p-2 rounded border border-[#DCE5EF]">
                <span className="text-gray-500 block font-sans text-[10px]">PayPal Order ID:</span>
                <span className="font-bold text-[#003087]">
                  {transaction.paypalOrderId || 'NOT_CREATED'}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-[#DCE5EF]">
                <span className="text-gray-500 block font-sans text-[10px]">Capture Reference:</span>
                <span className="font-bold text-[#0E8A44]">
                  {transaction.paypalCaptureId || 'NOT_CAPTURED'}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-[#DCE5EF]">
                <span className="text-gray-500 block font-sans text-[10px]">Payment Status:</span>
                <span className="font-bold text-gray-800">
                  {transaction.status === 'PAID' ? 'COMPLETED & VERIFIED' : transaction.status === 'APPROVED' ? 'AWAITING_BUYER_APPROVAL' : 'N/A'}
                </span>
              </div>
            </div>

            {/* Launch PayPal Checkout Button if transaction is approved and ready */}
            {transaction.status === 'APPROVED' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowCheckout(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0070E0] hover:bg-[#005ea6] text-white font-semibold rounded-lg shadow-sm transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Launch PayPal Sandbox Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#EEF3F8] bg-[#F8FAFD] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#DCE5EF] text-[#142B4A] hover:bg-[#F5F8FC] text-xs font-semibold rounded-lg transition"
          >
            Close Record
          </button>
        </div>
      </div>

      {/* PayPal Sandbox Checkout Modal */}
      {showCheckout && (
        <PayPalCheckoutModal
          transaction={transaction}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            if (onRefresh) onRefresh();
            onClose();
          }}
        />
      )}
    </div>
  );
};

