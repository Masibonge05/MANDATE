'use client';

import React, { useState } from 'react';
import { Mandate } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Sparkles,
  X,
  Play,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface MandateSimulationModalProps {
  mandates: Mandate[];
  onClose: () => void;
}

interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  expectedOutcome: 'APPROVED' | 'BLOCKED' | 'REQUIRES_APPROVAL';
  data: {
    amount: number;
    merchant: string;
    productCategory: string;
    productTitle: string;
    description: string;
    simulateExpired?: boolean;
  };
}

export const MandateSimulationModal: React.FC<MandateSimulationModalProps> = ({
  mandates,
  onClose,
}) => {
  const [selectedMandateId, setSelectedMandateId] = useState<string>(mandates[0]?.id || 'man-birthday-001');
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Custom Form Inputs
  const [amount, setAmount] = useState<number>(45.00);
  const [merchant, setMerchant] = useState('Apex Optics');
  const [category, setCategory] = useState('Photography Accessories');
  const [title, setTitle] = useState('Multi-Coated UV Lens Filter (67mm)');
  const [desc, setDesc] = useState('Optical glass filter with aluminium frame.');
  const [simulateExpired, setSimulateExpired] = useState(false);

  const presets: SimulationPreset[] = [
    {
      id: 'sim-1',
      name: '1. Within-Budget Authorized Merchant',
      description: 'Tests standard policy compliance: $45.00, Apex Optics, Photography Accessories.',
      expectedOutcome: 'APPROVED',
      data: {
        amount: 45.00,
        merchant: 'Apex Optics',
        productCategory: 'Photography Accessories',
        productTitle: 'Multi-Coated UV Lens Filter (67mm)',
        description: 'Standard optical camera accessory from approved merchant.',
      },
    },
    {
      id: 'sim-2',
      name: '2. Transaction Exceeding Budget',
      description: 'Tests deterministic budget ceiling: $150.00 requested against $100.00 limit.',
      expectedOutcome: 'BLOCKED',
      data: {
        amount: 150.00,
        merchant: 'Apex Optics',
        productCategory: 'Photography Accessories',
        productTitle: 'Heavy-Duty Studio Boom Arm',
        description: 'Large lighting boom arm exceeding single transaction and total budget.',
      },
    },
    {
      id: 'sim-3',
      name: '3. Unauthorized / Blacklisted Merchant',
      description: 'Tests merchant restriction: Attempt to purchase from ShadyReseller Store.',
      expectedOutcome: 'BLOCKED',
      data: {
        amount: 45.00,
        merchant: 'ShadyReseller Store',
        productCategory: 'Photography Accessories',
        productTitle: 'Discounted Camera Bag',
        description: 'Vendor not on approved whitelist and explicitly flagged on blocklist.',
      },
    },
    {
      id: 'sim-4',
      name: '4. Human Exception Trigger (Electronics)',
      description: 'Tests category exception rules: $79.00 PocketPhoto Printer flagged as Electronics.',
      expectedOutcome: 'REQUIRES_APPROVAL',
      data: {
        amount: 79.00,
        merchant: 'Apex Optics',
        productCategory: 'Electronics',
        productTitle: 'PocketPhoto Mobile Color Printer',
        description: 'ZINK photo printer; mandate explicitly demands human sign-off for Electronics.',
      },
    },
    {
      id: 'sim-5',
      name: '5. Expired Mandate Enforcement',
      description: 'Tests validity window: Attempting to transact against a mandate whose expiry has passed.',
      expectedOutcome: 'BLOCKED',
      data: {
        amount: 35.00,
        merchant: 'Apex Optics',
        productCategory: 'Photography Accessories',
        productTitle: 'Lens Cleaning Pen & Blower',
        description: 'Simulates transaction arriving after mandate expiry date.',
        simulateExpired: true,
      },
    },
  ];

  const runSimulation = async (params: any) => {
    try {
      setLoading(true);
      setSimResult(null);

      const res = await fetch('/api/mandates/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandateId: selectedMandateId,
          ...params,
        }),
      });

      const data = await res.json();
      setSimResult(data);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: SimulationPreset) => {
    setAmount(preset.data.amount);
    setMerchant(preset.data.merchant);
    setCategory(preset.data.productCategory);
    setTitle(preset.data.productTitle);
    setDesc(preset.data.description);
    setSimulateExpired(Boolean(preset.data.simulateExpired));
    runSimulation(preset.data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-modal border border-[#DCE5EF] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F8] flex items-center justify-between bg-[#F8FAFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 text-[#009CDE]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#142B4A]">Mandate Policy Simulation Mode</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3FC] text-[#0070E0] border border-[#CDE1F8]">
                  DRY-RUN ZERO RISK
                </span>
              </div>
              <p className="text-xs text-[#5E738B]">
                Test hypothetical agent transactions against deterministic rules and AI review without creating PayPal orders.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs text-[#142B4A] max-h-[80vh] overflow-y-auto">
          {/* Strict Simulation Disclaimer Banner */}
          <div className="p-3.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl flex items-start gap-2.5 text-[11px] text-[#5E738B]">
            <HelpCircle className="w-4 h-4 text-[#0070E0] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block mb-0.5">Simulation Environment Active:</strong>
              This tool passes transaction parameters through the exact same Deterministic Policy Engine and AI Reviewer as production proposals.
              <span className="text-[#003087] font-semibold"> No real funds are reserved, no PayPal sandbox orders are created, and no database balances are altered.</span>
            </div>
          </div>

          {/* Quick Benchmark Presets */}
          <div className="space-y-2">
            <span className="font-semibold text-gray-700 block">Required Benchmark Test Scenarios:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p)}
                  disabled={loading}
                  className="p-3 rounded-xl border border-[#DCE5EF] hover:border-[#0070E0] hover:bg-[#F5F8FC] text-left transition space-y-1 bg-white disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-[#003087]">{p.name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      p.expectedOutcome === 'APPROVED' ? 'bg-[#EBF8F0] text-[#0E8A44]' :
                      p.expectedOutcome === 'BLOCKED' ? 'bg-[#FEF3F2] text-[#D92D20]' :
                      'bg-[#FEF7EB] text-[#B46500]'
                    }`}>
                      {p.expectedOutcome}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Simulation Form */}
          <div className="bg-[#F8FAFD] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
            <span className="font-bold text-xs text-[#001C48] block">Custom Dry-Run Parameters:</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Simulated Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-[#DCE5EF] rounded-lg text-xs font-bold text-[#003087]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Simulated Merchant</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full p-2 bg-white border border-[#DCE5EF] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Product Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-white border border-[#DCE5EF] rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={simulateExpired}
                  onChange={(e) => setSimulateExpired(e.target.checked)}
                  className="rounded text-[#0070E0]"
                />
                <span>Simulate Expired Mandate Scenario</span>
              </label>

              <button
                onClick={() => runSimulation({
                  amount,
                  merchant,
                  productCategory: category,
                  productTitle: title,
                  description: desc,
                  simulateExpired,
                })}
                disabled={loading}
                className="px-5 py-2 bg-[#0070E0] hover:bg-[#005ea6] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Execute Dry-Run Simulation</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="space-y-4 animate-in fade-in duration-200 border-t border-[#EEF3F8] pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#001C48]">Simulation Evaluation Result</span>
                <span className="text-[10px] text-gray-400 font-mono">Timestamp: {simResult.timestamp}</span>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                simResult.outcome?.status === 'APPROVED'
                  ? 'bg-[#EBF8F0] border-[#A6E3B8] text-[#0E8A44]'
                  : simResult.outcome?.status === 'REQUIRES_APPROVAL'
                  ? 'bg-[#FEF7EB] border-[#F8D8A3] text-[#B46500]'
                  : 'bg-[#FEF3F2] border-[#F9A8A4] text-[#D92D20]'
              }`}>
                {simResult.outcome?.status === 'APPROVED' && <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
                {simResult.outcome?.status === 'REQUIRES_APPROVAL' && <AlertTriangle className="w-6 h-6 flex-shrink-0" />}
                {simResult.outcome?.status === 'BLOCKED' && <ShieldAlert className="w-6 h-6 flex-shrink-0" />}

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm uppercase">
                      SIMULATED OUTCOME: {simResult.outcome?.status.replace('_', ' ')}
                    </h4>
                    <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded font-mono font-bold">
                      DRY-RUN
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 mt-1 leading-relaxed">
                    {simResult.outcome?.primaryReason}
                  </p>
                </div>
              </div>

              {/* Checks Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {simResult.policyEvaluation?.detailedChecks?.map((chk: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                      chk.passed ? 'bg-white border-[#E2E8F0]' : 'bg-[#FEF3F2] border-[#F9A8A4]'
                    }`}
                  >
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0E8A44] flex-shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#D92D20] flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <span>{chk.ruleName}</span>
                        <span className={`text-[9px] px-1 rounded font-bold ${chk.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {chk.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">{chk.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

