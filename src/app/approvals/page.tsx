'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Loader2,
  Building2,
  Tag,
  CreditCard,
} from 'lucide-react';
import { PayPalLogo } from '@/components/common/PayPalLogo';
import { PayPalCheckoutModal } from '@/components/paypal/PayPalCheckoutModal';

export default function ApprovalsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTxForCheckout, setSelectedTxForCheckout] = useState<Transaction | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const demoToken = useRef<string | null>(null);

  const getDemoToken = async () => {
    if (demoToken.current) return demoToken.current;

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const payload: unknown = await response.json();
    if (
      !response.ok ||
      typeof payload !== 'object' ||
      payload === null ||
      !('access_token' in payload) ||
      typeof payload.access_token !== 'string'
    ) {
      throw new Error('Could not establish a demo session for approvals');
    }

    const token = payload.access_token;
    demoToken.current = token;
    return token;
  };

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const token = await getDemoToken();
      const res = await fetch('/api/transactions?status=REQUIRES_APPROVAL', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { transactions?: Transaction[]; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load pending approvals');
      if (!Array.isArray(data.transactions)) throw new Error('Approval response was invalid');
      setTransactions(data.transactions);
      setLoadError(null);
    } catch (err) {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (txId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setProcessingId(txId);
      const token = await getDemoToken();
      const res = await fetch(`/api/approvals/${txId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Approval action failed');
      }

      if (action === 'APPROVE' && data.transaction) {
        setSelectedTxForCheckout(data.transaction);
      }

      await fetchApprovals();
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
                Human Approval Centre
              </h1>
              <span className="bg-[#FEF7EB] text-[#B46500] border border-[#F8D8A3] text-xs font-bold px-2 py-0.5 rounded-full">
                {transactions.length} Pending
              </span>
            </div>
            <p className="text-xs text-[#5E738B] mt-1">
              Review and authorize policy exceptions before PayPal sandbox orders can be generated.
            </p>
          </div>
        </div>

        {/* Clear Fintech Distinction Notice */}
        <div className="bg-[#F8FAFD] border border-[#003087]/20 rounded-2xl p-4 text-xs text-[#142B4A] space-y-1.5 shadow-subtle">
          <div className="font-bold text-[#003087] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0070E0]" />
            <span>Important Distinction: MANDATE Exception vs. PayPal Payment Authorization</span>
          </div>
          <p className="text-gray-600 leading-relaxed text-[11px]">
            1. <strong>MANDATE Policy Approval:</strong> Authorizes the AI agent to exceed a rule (e.g. purchasing electronics).
            <br />
            2. <strong>PayPal Buyer Approval:</strong> Once approved here, the transaction unlocks PayPal Sandbox Checkout for actual payment execution.
          </p>
        </div>

        {/* Pending Requests List */}
        {loadError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-[#DCE5EF] bg-white p-8 text-center text-sm text-gray-500">
            Loading pending approvals...
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4 hover:border-[#0070E0]/30 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EEF3F8]">
                  <div className="flex items-center gap-3">
                    <img
                      src={tx.product.imageUrl}
                      alt={tx.product.title}
                      className="w-16 h-16 rounded-xl object-cover border border-[#DCE5EF]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#001C48]">{tx.product.title}</h3>
                        <span className="px-2 py-0.5 bg-[#FEF7EB] border border-[#F8D8A3] text-[#B46500] font-bold text-[10px] rounded uppercase">
                          REVIEW REQUIRED
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>Merchant: <strong className="text-gray-800">{tx.product.merchant}</strong></span>
                        <span>•</span>
                        <span>Category: <strong className="text-gray-800">{tx.product.category}</strong></span>
                        <span>•</span>
                        <span>Mandate: <strong className="text-gray-800">{tx.mandateName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#5E738B]">Requested Amount</div>
                    <div className="text-2xl font-black text-[#003087]">
                      {formatCurrency(tx.amount, tx.currency)}
                    </div>
                  </div>
                </div>

                {/* Reason Exception is Needed */}
                <div className="p-3 bg-[#FEF7EB]/40 border border-[#F8D8A3] rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#B46500] block">Trigger Reason:</span>
                  <p className="text-gray-700 leading-relaxed">
                    {tx.approvalReason || tx.policyEvaluation?.explanation}
                  </p>
                </div>

                {/* AI Review Summary */}
                <div className="p-3 bg-[#F8FAFD] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-gray-700 block">AI Intent & Risk Findings:</span>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{tx.aiReview?.explanation}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleAction(tx.id, 'REJECT')}
                    disabled={processingId === tx.id}
                    className="px-5 py-2.5 bg-white border border-[#DCE5EF] hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Reject Exception</span>
                  </button>

                  <button
                    onClick={() => handleAction(tx.id, 'APPROVE')}
                    disabled={processingId === tx.id}
                    className="px-6 py-2.5 bg-[#0070E0] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {processingId === tx.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Approve Exception & Proceed to PayPal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE5EF] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EBF8F0] text-[#0E8A44] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#001C48]">All Clear! No Pending Approvals</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              All transactions have either been automatically approved by policy or rejected at the gateway.
            </p>
          </div>
        )}
      </div>

      {/* PayPal Sandbox Checkout Modal when approved */}
      {selectedTxForCheckout && (
        <PayPalCheckoutModal
          transaction={selectedTxForCheckout}
          onClose={() => setSelectedTxForCheckout(null)}
          onSuccess={() => {
            setSelectedTxForCheckout(null);
            fetchApprovals();
          }}
        />
      )}
    </AppShell>
  );
}

