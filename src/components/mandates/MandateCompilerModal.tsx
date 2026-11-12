'use client';

import React, { useState } from 'react';
import { CompiledMandateData } from '@/lib/mandate-compiler';
import { Sparkles, X, Check, Shield, AlertTriangle, ArrowRight, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';

interface MandateCompilerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const MandateCompilerModal: React.FC<MandateCompilerModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'prompt' | 'compiling' | 'review'>('prompt');
  const [promptText, setPromptText] = useState(
    'Find a birthday gift for my sister. She likes photography. You may spend a maximum of $100. Only purchase from approved merchants. Electronics require my approval.'
  );
  const [compiledData, setCompiledData] = useState<CompiledMandateData | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samplePrompts = [
    {
      label: 'Photography Gift (Competition Default)',
      text: 'Find a birthday gift for my sister. She likes photography. Budget is $100. Approved merchants only (Apex Optics, B&H). Electronics require my approval.',
    },
    {
      label: 'Office Electronics & Equipment',
      text: 'Procure modern desk accessories and stationery up to $300 total budget. Single item limit of $80. All electronics require human approval.',
    },
    {
      label: 'Open Procurement with Spending Cap',
      text: 'Order emergency tech accessories up to $150 from any merchant. Expiration in 7 days.',
    },
  ];

  const handleCompile = async () => {
    if (!promptText.trim()) return;
    try {
      setStep('compiling');
      setErrorMsg(null);

      const res = await fetch('/api/mandates/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText.trim(), currency: 'USD' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Compilation failed');
      }

      setCompiledData(data.compiled);
      setStep('review');
    } catch (err: any) {
      console.error('[Compilation Error]:', err);
      setErrorMsg(err.message || 'Failed to parse natural language mandate');
      setStep('prompt');
    }
  };

  const handleSaveAndActivate = async () => {
    if (!compiledData) return;
    try {
      setSaving(true);
      setErrorMsg(null);

      const res = await fetch('/api/mandates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...compiledData,
          rawPrompt: promptText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to activate mandate');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save mandate');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-modal border border-[#DCE5EF] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F8] flex items-center justify-between bg-[#F8FAFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0070E0] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#142B4A]">Mandate Compiler Studio</h3>
              <p className="text-xs text-[#5E738B]">Natural language to deterministic financial spending policy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-[#142B4A]">
          {errorMsg && (
            <div className="p-3 bg-[#FEF3F2] border border-[#F9A8A4] rounded-lg text-[#D92D20] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'prompt' && (
            <div className="space-y-4">
              <label className="block font-semibold text-xs text-gray-700">
                Describe the agent's financial permissions in plain English:
              </label>
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. Find a birthday gift for my sister. Budget is $100. Approved merchants only..."
                className="w-full p-3 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0070E0] text-[#142B4A] leading-relaxed"
              />

              {/* Sample Prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#5E738B]">Or select a preset prompt:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPromptText(p.text)}
                      className="text-left p-2.5 rounded-lg border border-[#EEF3F8] hover:border-[#0070E0] hover:bg-[#F5F8FC] transition text-[11px] text-[#142B4A] font-medium flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0] flex-shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCompile}
                  disabled={!promptText.trim()}
                  className="px-5 py-2.5 bg-[#0070E0] hover:bg-[#005ea6] text-white font-semibold rounded-xl shadow-sm transition flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compile into Enforceable Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'compiling' && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#0070E0] animate-spin mx-auto" />
              <h4 className="font-bold text-sm text-[#001C48]">
                Compiling mandate rules with Gemini AI...
              </h4>
              <p className="text-gray-500 text-xs">
                Extracting budgets, merchant whitelists, category constraints, and approval rules into strict schema.
              </p>
            </div>
          )}

          {step === 'review' && compiledData && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-[#EBF3FC] border border-[#CDE1F8] p-3 rounded-xl text-[11px] text-[#003087]">
                <strong>AI Interpretation Ready:</strong> Review every parameter before activation. Deterministic rules will be strictly enforced at the gateway.
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Mandate Name</label>
                  <input
                    type="text"
                    value={compiledData.name}
                    onChange={(e) => setCompiledData({ ...compiledData, name: e.target.value })}
                    className="w-full p-2 bg-[#F8FAFD] border border-[#DCE5EF] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Total Budget ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={compiledData.totalBudget}
                    onChange={(e) => setCompiledData({ ...compiledData, totalBudget: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-[#F8FAFD] border border-[#DCE5EF] rounded-lg text-xs font-bold text-[#003087]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Max Single Transaction ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={compiledData.maxTransactionAmount}
                    onChange={(e) => setCompiledData({ ...compiledData, maxTransactionAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-[#F8FAFD] border border-[#DCE5EF] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Approval Threshold ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={compiledData.approvalThreshold}
                    onChange={(e) => setCompiledData({ ...compiledData, approvalThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-[#F8FAFD] border border-[#DCE5EF] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Lists */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-gray-700">Approved Merchants (Whitelist)</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8FAFD] border border-[#DCE5EF] rounded-lg">
                  {compiledData.approvedMerchants.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-[#DCE5EF] rounded text-[11px] font-medium flex items-center gap-1">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-gray-700">Categories Requiring Human Approval</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#FEF7EB] border border-[#F8D8A3] rounded-lg text-[#B46500]">
                  {compiledData.approvalRequiredCategories.length > 0 ? (
                    compiledData.approvalRequiredCategories.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-[#F8D8A3] rounded text-[11px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-[#B46500]" />
                        <span>{c}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">None specified</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#EEF3F8]">
                <button
                  onClick={() => setStep('prompt')}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1.5 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Instruction</span>
                </button>

                <button
                  onClick={handleSaveAndActivate}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#003087] hover:bg-[#001C48] text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Activate Mandate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

