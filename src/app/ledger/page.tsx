'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SecurityLedgerGrid } from '@/components/ledger/SecurityLedgerGrid';
import { Transaction } from '@/lib/types';
import { ShieldCheck, Download, RefreshCw, FileText, Loader2 } from 'lucide-react';

function LedgerContent() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (data.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Transaction ID', 'Timestamp', 'Mandate', 'Merchant', 'Product', 'Amount', 'Currency', 'Policy Decision', 'AI Risk', 'Status', 'PayPal Order ID'];
    const rows = transactions.map(t => [
      t.id,
      t.createdAt,
      `"${t.mandateName}"`,
      `"${t.product.merchant}"`,
      `"${t.product.title}"`,
      t.amount,
      t.currency,
      t.policyDecision,
      t.aiReview?.risk_level || 'N/A',
      t.status,
      t.paypalOrderId || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mandate-security-ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
              Security & Audit Ledger
            </h1>
            <span className="text-xs bg-[#EBF3FC] text-[#003087] font-bold px-2 py-0.5 rounded-full border border-[#CDE1F8]">
              AG Grid Community Edition
            </span>
          </div>
          <p className="text-xs text-[#5E738B] mt-1">
            Append-only audit trail recording every autonomous proposal, deterministic policy check, and PayPal payment event.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2 bg-white border border-[#DCE5EF] text-gray-600 hover:text-gray-900 rounded-xl transition shadow-xs"
            title="Refresh Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DCE5EF] hover:bg-gray-50 text-[#142B4A] text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* AG Grid Component */}
      <SecurityLedgerGrid
        transactions={transactions}
        onRefresh={fetchTransactions}
      />
    </div>
  );
}

export default function SecurityLedgerPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="py-20 text-center flex flex-col items-center gap-3 text-xs text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0070E0]" />
          <span>Loading Audit Ledger...</span>
        </div>
      }>
        <LedgerContent />
      </Suspense>
    </AppShell>
  );
}
