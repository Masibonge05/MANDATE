'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '@/lib/formatters';
import { Mandate, Transaction, SystemAnalytics, AuditEvent } from '@/lib/types';
import {
  FileCheck2,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  BarChart3,
  Layers,
} from 'lucide-react';
import { PayPalLogo } from '@/components/common/PayPalLogo';
import { MandateCompilerModal } from '@/components/mandates/MandateCompilerModal';

export default function DashboardPage() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompiler, setShowCompiler] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mandatesRes, txRes, analyticsRes] = await Promise.all([
        fetch('/api/mandates'),
        fetch('/api/transactions'),
        fetch('/api/analytics'),
      ]);

      const [mJson, tJson, aJson] = await Promise.all([
        mandatesRes.json(),
        txRes.json(),
        analyticsRes.json(),
      ]);

      if (mJson.mandates) setMandates(mJson.mandates);
      if (tJson.transactions) setTransactions(tJson.transactions);
      if (aJson.analytics) setAnalytics(aJson.analytics);
      if (aJson.recentAudits) setRecentAudits(aJson.recentAudits);
    } catch (err) {
      console.error('[Dashboard Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeMandates = mandates.filter((m) => m.status === 'active');
  const pendingApprovals = transactions.filter((t) => t.status === 'REQUIRES_APPROVAL');

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
              Financial Control Overview
            </h1>
            <p className="text-xs text-[#5E738B] mt-1">
              Deterministic spending boundaries & AI transaction reviewer status for autonomous agents.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 bg-white border border-[#DCE5EF] text-gray-600 hover:text-gray-900 rounded-xl transition shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCompiler(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0070E0] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Mandate</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards: Strictly Separated Financial Figures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Captured Spending (Strictly PAID via PayPal) */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5E738B]">Captured Spending</span>
              <div className="w-8 h-8 rounded-lg bg-[#0E8A44]/10 flex items-center justify-center text-[#0E8A44]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0E8A44]">
                {formatCurrency(analytics?.capturedSpending ?? analytics?.totalAuthorizedSpending ?? 0)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Completed & captured via PayPal
              </div>
            </div>
          </div>

          {/* Card 2: Reserved Spending in Flight */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5E738B]">Reserved In-Flight</span>
              <div className="w-8 h-8 rounded-lg bg-[#B46500]/10 flex items-center justify-center text-[#B46500]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#B46500]">
                {formatCurrency(analytics?.reservedSpending || 0)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {pendingApprovals.length} pending review / in checkout
              </div>
            </div>
          </div>

          {/* Card 3: Available Spending Capacity */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5E738B]">Available Capacity</span>
              <div className="w-8 h-8 rounded-lg bg-[#0070E0]/10 flex items-center justify-center text-[#0070E0]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0070E0]">
                {formatCurrency(analytics?.availableSpending || (mandates[0] ? Math.max(0, mandates[0].totalBudget - mandates[0].spentAmount - mandates[0].reservedAmount) : 0))}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Unallocated across {activeMandates.length} active mandate{activeMandates.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Card 4: Blocked Attempted Value (Policy Enforced, NOT "Money Saved") */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5E738B]">Blocked Attempted Value</span>
              <div className="w-8 h-8 rounded-lg bg-[#D92D20]/10 flex items-center justify-center text-[#D92D20]">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#D92D20]">
                {formatCurrency(analytics?.blockedAttemptsValue ?? analytics?.totalBlockedSpending ?? 0)}
              </div>
              <div className="text-[11px] text-red-600 font-medium mt-0.5 flex items-center gap-1">
                <span>{analytics?.promptInjectionsBlocked || 0} prompt injections blocked (not money saved)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Policy Status & Budget Meter */}
        <div className="bg-white p-6 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E8A44] animate-pulse" />
              <h2 className="font-bold text-sm text-[#001C48]">Active Financial Policy</h2>
            </div>
            <Link href="/mandates" className="text-xs font-semibold text-[#0070E0] hover:underline flex items-center gap-1">
              <span>Manage all mandates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {mandates[0] ? (
            <div className="space-y-3 bg-[#F8FAFD] p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-[#003087]">{mandates[0].name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{mandates[0].description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#5E738B]">Total Spending Limit</span>
                  <div className="text-xl font-black text-[#001C48]">
                    {formatCurrency(mandates[0].totalBudget, mandates[0].currency)}
                  </div>
                </div>
              </div>

              {/* Budget Progress Meter */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Spent: {formatCurrency(mandates[0].spentAmount, mandates[0].currency)}</span>
                  <span>Reserved: {formatCurrency(mandates[0].reservedAmount, mandates[0].currency)}</span>
                  <span className="font-bold text-[#0E8A44]">
                    Available: {formatCurrency(mandates[0].totalBudget - mandates[0].spentAmount - mandates[0].reservedAmount, mandates[0].currency)}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, (mandates[0].spentAmount / mandates[0].totalBudget) * 100)}%` }}
                    className="bg-[#003087] h-full"
                    title="Spent"
                  />
                  <div
                    style={{ width: `${Math.min(100, (mandates[0].reservedAmount / mandates[0].totalBudget) * 100)}%` }}
                    className="bg-[#B46500] h-full"
                    title="Reserved for Pending Approvals"
                  />
                </div>
              </div>

              {/* Policy Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EEF3F8] text-[11px]">
                <span className="font-semibold text-gray-700">Rules Enforced:</span>
                <span className="px-2 py-0.5 bg-white border border-[#DCE5EF] rounded font-medium text-gray-800">
                  Approved Merchants Only
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#DCE5EF] rounded font-medium text-gray-800">
                  Max Single Tx: {formatCurrency(mandates[0].maxTransactionAmount, mandates[0].currency)}
                </span>
                <span className="px-2 py-0.5 bg-[#FEF7EB] border border-[#F8D8A3] rounded font-bold text-[#B46500]">
                  Electronics Requires Approval
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 text-xs">
              No active mandates found. Create your first mandate to authorize AI agents.
            </div>
          )}
        </div>

        {/* Financial Intelligence & Operational Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Spending by Category */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEF3F8]">
              <span className="text-xs font-bold text-[#001C48] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#0070E0]" />
                Spending by Category
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Captured & Approved</span>
            </div>
            {analytics?.spendingByCategory && analytics.spendingByCategory.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {analytics.spendingByCategory.slice(0, 4).map((c, idx) => {
                  const maxAmt = Math.max(...(analytics.spendingByCategory?.map(x => x.amount) || [1]), 1);
                  const pct = Math.round((c.amount / maxAmt) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-800 truncate">{c.category}</span>
                        <span className="font-bold text-[#003087]">{formatCurrency(c.amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EEF3F8] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-[#0070E0] rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-xs">No categorised spending recorded yet</div>
            )}
          </div>

          {/* Card 2: Spending by Merchant */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEF3F8]">
              <span className="text-xs font-bold text-[#001C48] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0E8A44]" />
                Top Approved Merchants
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Whitelist Compliant</span>
            </div>
            {analytics?.spendingByMerchant && analytics.spendingByMerchant.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {analytics.spendingByMerchant.slice(0, 4).map((m, idx) => {
                  const maxAmt = Math.max(...(analytics.spendingByMerchant?.map(x => x.amount) || [1]), 1);
                  const pct = Math.round((m.amount / maxAmt) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-800 truncate">{m.merchant}</span>
                        <span className="font-bold text-[#0E8A44]">{formatCurrency(m.amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EEF3F8] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-[#0E8A44] rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-xs">No merchant transactions recorded yet</div>
            )}
          </div>

          {/* Card 3: Risk & Policy Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EEF3F8]">
              <span className="text-xs font-bold text-[#001C48] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D92D20]" />
                Risk & Policy Distribution
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Gateway Telemetry</span>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#EBF8F0]">
                <span className="font-semibold text-[#0E8A44] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0E8A44]" />
                  Low Risk (Compliant)
                </span>
                <span className="font-bold text-[#0E8A44]">{analytics?.riskDistribution?.low || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FEF7EB]">
                <span className="font-semibold text-[#B46500] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B46500]" />
                  Medium Risk / Approval Triggered
                </span>
                <span className="font-bold text-[#B46500]">{analytics?.riskDistribution?.medium || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FEF3F2]">
                <span className="font-semibold text-[#D92D20] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D92D20]" />
                  Adversarial Prompt Injections Blocked
                </span>
                <span className="font-bold text-[#D92D20]">{analytics?.promptInjectionsBlocked || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Recent Gateway Activity & Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Exceptions Requiring Approval */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B46500]" />
                <h3 className="font-bold text-sm text-[#001C48]">
                  Pending Human Approvals ({pendingApprovals.length})
                </h3>
              </div>
              <Link href="/approvals" className="text-xs font-semibold text-[#0070E0] hover:underline">
                View all
              </Link>
            </div>

            {pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl border border-[#F8D8A3] bg-[#FEF7EB]/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{tx.product.title}</div>
                      <div className="text-gray-600 mt-0.5">
                        {tx.product.merchant} • {tx.product.category}
                      </div>
                      <div className="text-[11px] text-[#B46500] font-semibold mt-1">
                        Reason: {tx.approvalReason || 'Special Category Approval Required'}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="font-bold text-sm text-[#003087]">
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                      <Link
                        href="/approvals"
                        className="px-3 py-1 bg-[#0070E0] text-white font-semibold rounded-lg text-[11px] hover:bg-[#005ea6] transition"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs bg-[#F8FAFD] rounded-xl border border-dashed border-[#DCE5EF]">
                No pending approval requests. All agent proposals are fully resolved.
              </div>
            )}
          </div>

          {/* Immutable Gateway Audit Feed */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#003087]" />
                <h3 className="font-bold text-sm text-[#001C48]">
                  Recent Security Events
                </h3>
              </div>
              <Link href="/ledger" className="text-xs font-semibold text-[#0070E0] hover:underline">
                Open Ledger
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {recentAudits.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#EEF3F8] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-[11px]">{evt.title}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(evt.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mandate Compiler Studio Modal */}
      {showCompiler && (
        <MandateCompilerModal
          onClose={() => setShowCompiler(false)}
          onSuccess={() => {
            setShowCompiler(false);
            fetchData();
          }}
        />
      )}
    </AppShell>
  );
}

