'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SystemAnalytics, Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PieChart,
  Percent,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [aRes, tRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/transactions'),
        ]);
        const [aData, tData] = await Promise.all([aRes.json(), tRes.json()]);
        if (aData.analytics) setAnalytics(aData.analytics);
        if (tData.transactions) setTransactions(tData.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalEvaluated = analytics?.totalProposals || 0;
  const approvedCount = (analytics?.approvedCount || 0) + (analytics?.paidCount || 0);
  const blockedCount = analytics?.blockedCount || 0;
  const pendingCount = analytics?.pendingApprovalCount || 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
            Financial & Security Analytics
          </h1>
          <p className="text-xs text-[#5E738B] mt-1">
            Real-time telemetry and policy enforcement statistics observed across autonomous AI agents.
          </p>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-2">
            <span className="text-xs font-semibold text-[#5E738B]">Total Evaluated Proposals</span>
            <div className="text-3xl font-black text-[#001C48]">{totalEvaluated}</div>
            <p className="text-[11px] text-gray-500">Autonomous purchasing actions inspected</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-2">
            <span className="text-xs font-semibold text-[#5E738B]">Approval Compliance Rate</span>
            <div className="text-3xl font-black text-[#0E8A44]">
              {analytics?.approvalRate || 0}%
            </div>
            <p className="text-[11px] text-[#0E8A44] font-medium">Passed both security layers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-2">
            <span className="text-xs font-semibold text-[#5E738B]">Gateway Block Rate</span>
            <div className="text-3xl font-black text-[#D92D20]">
              {analytics?.blockRate || 0}%
            </div>
            <p className="text-[11px] text-[#D92D20] font-medium">Stopped before touching payment rail</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-2">
            <span className="text-xs font-semibold text-[#5E738B]">Capital Protected</span>
            <div className="text-3xl font-black text-[#003087]">
              {formatCurrency(analytics?.totalBlockedSpending || 0)}
            </div>
            <p className="text-[11px] text-gray-500">Unauthorized funds prevented from leaving</p>
          </div>
        </div>

        {/* Financial Flow Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-4">
            <h3 className="font-bold text-sm text-[#001C48] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0070E0]" />
              <span>Decision Breakdown</span>
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#0E8A44]">Approved / Paid</span>
                  <span>{approvedCount} ({totalEvaluated > 0 ? Math.round((approvedCount / totalEvaluated) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalEvaluated > 0 ? (approvedCount / totalEvaluated) * 100 : 0}%` }}
                    className="h-full bg-[#0E8A44]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#D92D20]">Blocked by Security Policy</span>
                  <span>{blockedCount} ({totalEvaluated > 0 ? Math.round((blockedCount / totalEvaluated) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalEvaluated > 0 ? (blockedCount / totalEvaluated) * 100 : 0}%` }}
                    className="h-full bg-[#D92D20]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#B46500]">Pending Human Approval</span>
                  <span>{pendingCount} ({totalEvaluated > 0 ? Math.round((pendingCount / totalEvaluated) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${totalEvaluated > 0 ? (pendingCount / totalEvaluated) * 100 : 0}%` }}
                    className="h-full bg-[#B46500]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-4">
            <h3 className="font-bold text-sm text-[#001C48] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D92D20]" />
              <span>Threat Defense Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-[#FEF3F2] border border-[#F9A8A4] space-y-1">
                <span className="text-gray-600 block text-[11px]">Prompt Injections Neutralized</span>
                <span className="text-2xl font-black text-[#D92D20]">
                  {analytics?.promptInjectionsBlocked || 0}
                </span>
                <p className="text-[10px] text-gray-500">Adversarial payload attacks</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
                <span className="text-gray-600 block text-[11px]">Merchant Whitelist Violations</span>
                <span className="text-2xl font-black text-[#003087]">
                  {transactions.filter(t => t.policyEvaluation?.reasonCodes?.some(r => r.includes('MERCHANT'))).length}
                </span>
                <p className="text-[10px] text-gray-500">Unapproved vendor attempts</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
                <span className="text-gray-600 block text-[11px]">Budget Ceiling Overflows</span>
                <span className="text-2xl font-black text-[#003087]">
                  {transactions.filter(t => t.policyEvaluation?.reasonCodes?.some(r => r.includes('BUDGET') || r.includes('AMOUNT'))).length}
                </span>
                <p className="text-[10px] text-gray-500">Amounts exceeding limit</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-1">
                <span className="text-gray-600 block text-[11px]">Special Category Triggers</span>
                <span className="text-2xl font-black text-[#B46500]">
                  {transactions.filter(t => t.policyEvaluation?.reasonCodes?.some(r => r.includes('CATEGORY'))).length}
                </span>
                <p className="text-[10px] text-gray-500">Electronics exceptions flagged</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

