'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Mandate } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  FileCheck2,
  Plus,
  Play,
  Pause,
  Trash2,
  Building2,
  Tag,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
  FlaskConical,
  History,
} from 'lucide-react';
import { MandateCompilerModal } from '@/components/mandates/MandateCompilerModal';
import { MandateSimulationModal } from '@/components/mandates/MandateSimulationModal';
import { MandateVersionHistoryModal } from '@/components/mandates/MandateVersionHistoryModal';

function MandatesContent() {
  const searchParams = useSearchParams();
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompiler, setShowCompiler] = useState(searchParams.get('create') === 'true');
  const [showSimulation, setShowSimulation] = useState(searchParams.get('simulate') === 'true');
  const [selectedMandateForHistory, setSelectedMandateForHistory] = useState<Mandate | null>(null);

  const fetchMandates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mandates');
      const data = await res.json();
      if (data.mandates) setMandates(data.mandates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Mandate['status']) => {
    try {
      const res = await fetch(`/api/mandates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchMandates();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
            Mandate Studio
          </h1>
          <p className="text-xs text-[#5E738B] mt-1">
            Construct, edit, and enforce natural language financial permissions for autonomous agents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulation(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCE5EF] hover:bg-[#F8FAFD] text-[#003087] text-xs font-bold rounded-xl shadow-xs transition"
          >
            <FlaskConical className="w-4 h-4 text-[#0070E0]" />
            <span>Simulation Mode (Dry-Run)</span>
          </button>

          <button
            onClick={() => setShowCompiler(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0070E0] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Compile New Mandate with AI</span>
          </button>
        </div>
      </div>

      {/* Mandate List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mandates.map((m) => {
          const available = m.totalBudget - m.spentAmount - m.reservedAmount;
          const spentPercent = (m.spentAmount / m.totalBudget) * 100;
          const reservedPercent = (m.reservedAmount / m.totalBudget) * 100;

          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 flex flex-col justify-between space-y-4 hover:border-[#0070E0]/40 transition"
            >
              {/* Header & Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#001C48]">{m.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'active'
                        ? 'bg-[#EBF8F0] text-[#0E8A44]'
                        : m.status === 'paused'
                        ? 'bg-[#FEF7EB] text-[#B46500]'
                        : 'bg-[#FEF3F2] text-[#D92D20]'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                    {m.description}
                  </p>
                </div>

                <span className="font-mono text-xs font-semibold bg-[#F5F8FC] border border-[#DCE5EF] text-[#5E738B] px-2 py-0.5 rounded">
                  v{m.version}
                </span>
              </div>

              {/* Budget Progression Bar */}
              <div className="bg-[#F8FAFD] p-3.5 rounded-xl border border-[#EEF3F8] space-y-2 text-xs">
                <div className="flex justify-between items-baseline font-medium">
                  <span className="text-[#5E738B]">Total Spending Limit</span>
                  <span className="text-lg font-black text-[#003087]">
                    {formatCurrency(m.totalBudget, m.currency)}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                  <div style={{ width: `${spentPercent}%` }} className="bg-[#003087] h-full" title="Spent" />
                  <div style={{ width: `${reservedPercent}%` }} className="bg-[#B46500] h-full" title="Reserved" />
                </div>

                <div className="flex justify-between text-[11px] text-gray-600 font-medium pt-1">
                  <span>Spent: {formatCurrency(m.spentAmount, m.currency)}</span>
                  <span>Reserved: {formatCurrency(m.reservedAmount, m.currency)}</span>
                  <span className="font-bold text-[#0E8A44]">
                    Available: {formatCurrency(available, m.currency)}
                  </span>
                </div>
              </div>

              {/* Rules & Permissions Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Max Single Tx</span>
                  <span className="font-bold text-gray-900">{formatCurrency(m.maxTransactionAmount, m.currency)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Valid Until</span>
                  <span className="font-bold text-gray-900">{formatDate(m.expiryDate).split(',')[0]}</span>
                </div>
              </div>

              {/* Whitelist Tags */}
              <div className="space-y-1.5 text-[11px]">
                <span className="font-semibold text-gray-700">Approved Merchants:</span>
                <div className="flex flex-wrap gap-1">
                  {m.approvedMerchants.map((merchant, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#F5F8FC] border border-[#DCE5EF] text-gray-800 rounded font-medium">
                      {merchant}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category Restrictions */}
              {m.approvalRequiredCategories.length > 0 && (
                <div className="text-[11px] text-[#B46500] bg-[#FEF7EB] border border-[#F8D8A3] p-2 rounded-lg font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Requires Human Review: {m.approvalRequiredCategories.join(', ')}</span>
                </div>
              )}

              {/* Controls & Actions */}
              <div className="pt-3 border-t border-[#EEF3F8] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {m.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(m.id, 'paused')}
                      className="px-3 py-1.5 rounded-lg border border-[#DCE5EF] hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(m.id, 'active')}
                      className="px-3 py-1.5 rounded-lg bg-[#0E8A44] hover:bg-[#0c783b] text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleStatusChange(m.id, 'revoked')}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                  >
                    Revoke
                  </button>

                  <button
                    onClick={() => setSelectedMandateForHistory(m)}
                    className="px-3 py-1.5 rounded-lg border border-[#DCE5EF] hover:bg-[#F0F5FA] text-[#003087] text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Inspect policy change history and previous limits"
                  >
                    <History className="w-3.5 h-3.5 text-[#0070E0]" />
                    <span>Version History</span>
                  </button>
                </div>

                <Link
                  href={`/ledger?mandateId=${m.id}`}
                  className="text-xs font-bold text-[#0070E0] hover:underline flex items-center gap-1"
                >
                  <span>View Transactions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {showSimulation && (
        <MandateSimulationModal
          mandates={mandates}
          onClose={() => setShowSimulation(false)}
        />
      )}

      {showCompiler && (
        <MandateCompilerModal
          onClose={() => setShowCompiler(false)}
          onSuccess={() => {
            setShowCompiler(false);
            fetchMandates();
          }}
        />
      )}

      {selectedMandateForHistory && (
        <MandateVersionHistoryModal
          mandate={selectedMandateForHistory}
          onClose={() => setSelectedMandateForHistory(null)}
        />
      )}
    </div>
  );
}

export default function MandatesPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="py-20 text-center flex flex-col items-center gap-3 text-xs text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0070E0]" />
          <span>Loading Mandate Studio...</span>
        </div>
      }>
        <MandatesContent />
      </Suspense>
    </AppShell>
  );
}
