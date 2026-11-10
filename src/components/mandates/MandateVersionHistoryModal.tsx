'use client';

import React, { useEffect, useState } from 'react';
import { Mandate, MandateVersion } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  X,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Tag,
  Building2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface MandateVersionHistoryModalProps {
  mandate: Mandate;
  onClose: () => void;
}

export const MandateVersionHistoryModal: React.FC<MandateVersionHistoryModalProps> = ({
  mandate,
  onClose,
}) => {
  const [versions, setVersions] = useState<MandateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<MandateVersion | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/mandates/${mandate.id}/versions`);
        const data = await res.json();
        if (data.versions && data.versions.length > 0) {
          setVersions(data.versions);
          setSelectedVersion(data.versions[0]);
        } else {
          // Fallback initial version from mandate
          const initialVersion: MandateVersion = {
            id: 'mv-001',
            mandateId: mandate.id,
            version: mandate.version || 1,
            changesSummary: 'Initial policy creation from natural language prompt',
            snapshot: { ...mandate },
            createdAt: mandate.createdAt,
          };
          setVersions([initialVersion]);
          setSelectedVersion(initialVersion);
        }
      } catch (err) {
        console.error('Failed to load mandate versions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [mandate]);

  const snapshot = selectedVersion?.snapshot;
  const approvedMerchants = snapshot?.approvedMerchants ?? [];
  const allowedCategories = snapshot?.allowedCategories ?? [];
  const approvalRequiredCategories = snapshot?.approvalRequiredCategories ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-modal border border-[#DCE5EF] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEF3F8] flex items-center justify-between bg-[#F8FAFD]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#003087]/10 flex items-center justify-center text-[#003087]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#142B4A] text-base">Policy Version History</h3>
                <span className="text-xs bg-[#EBF3FC] text-[#003087] font-bold px-2 py-0.5 rounded-full border border-[#CDE1F8]">
                  Mandate: {mandate.name}
                </span>
              </div>
              <p className="text-xs text-[#5E738B]">
                Cryptographic audit trail of all spending-limit and permission revisions. Active Version: v{mandate.version || 1}
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

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#0070E0]" />
            <span className="text-xs text-gray-500">Loading version records...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DCE5EF] flex-1 overflow-hidden">
            {/* Version Timeline List */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E738B] block mb-1">
                Version Timeline ({versions.length})
              </span>
              {versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                const isCurrent = ver.version === (mandate.version || 1);
                return (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#EBF3FC] border-[#0070E0] shadow-xs'
                        : 'bg-white border-[#DCE5EF] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#001C48]">
                        <span>Version {ver.version}.0</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8] font-bold px-1.5 py-0.2 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatDate(ver.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5E738B] line-clamp-2">
                      {ver.changesSummary}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Version Detail View */}
            <div className="p-6 md:col-span-2 overflow-y-auto max-h-[60vh] space-y-5 text-xs">
              {selectedVersion ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#001C48]">
                          Policy Snapshot: Version {selectedVersion.version}.0
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          Effective: {formatDate(selectedVersion.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedVersion.changesSummary}
                      </p>
                    </div>
                  </div>

                  {/* Financial Bounds in this Version */}
                  <div className="grid grid-cols-3 gap-3 bg-[#F8FAFD] p-4 rounded-xl border border-[#EEF3F8]">
                    <div>
                      <span className="text-[10px] text-[#5E738B] font-semibold block uppercase">Total Budget</span>
                      <span className="text-lg font-black text-[#003087]">
                        {formatCurrency(selectedVersion.snapshot.totalBudget ?? 0, selectedVersion.snapshot.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5E738B] font-semibold block uppercase">Max Single Tx</span>
                      <span className="text-lg font-black text-[#0070E0]">
                        {formatCurrency(selectedVersion.snapshot.maxTransactionAmount ?? 0, selectedVersion.snapshot.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5E738B] font-semibold block uppercase">Approval Threshold</span>
                      <span className="text-lg font-black text-[#B46500]">
                        {formatCurrency(selectedVersion.snapshot.approvalThreshold ?? 0, selectedVersion.snapshot.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Permission Rules */}
                  <div className="space-y-3">
                    <span className="font-bold text-xs text-[#001C48] block">Permission Rules in This Version:</span>

                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded-lg border border-[#DCE5EF] flex items-start gap-2.5">
                        <Building2 className="w-4 h-4 text-[#0070E0] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-gray-800">Approved Merchants ({approvedMerchants.length}):</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {approvedMerchants.length > 0 ? (
                              approvedMerchants.map((m, i) => (
                                <span key={i} className="px-2 py-0.5 bg-[#EBF3FC] text-[#003087] rounded text-[11px] font-medium">
                                  {m}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">None whitelisted (open or restricted)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-[#DCE5EF] flex items-start gap-2.5">
                        <Tag className="w-4 h-4 text-[#0E8A44] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-gray-800">Allowed Categories ({allowedCategories.length}):</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {allowedCategories.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 bg-[#EBF8F0] text-[#0E8A44] rounded text-[11px] font-medium">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {approvalRequiredCategories.length > 0 && (
                        <div className="bg-[#FEF7EB] p-3 rounded-lg border border-[#F8D8A3] flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-[#B46500] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-[#B46500]">Categories Requiring Human Sign-off:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {approvalRequiredCategories.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white border border-[#F8D8A3] text-[#B46500] rounded text-[11px] font-bold">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  Select a version to view snapshot details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#EEF3F8] bg-[#F8FAFD] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#DCE5EF] text-[#142B4A] hover:bg-[#F5F8FC] text-xs font-semibold rounded-lg transition"
          >
            Close Version History
          </button>
        </div>
      </div>
    </div>
  );
};

