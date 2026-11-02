'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Agent, Mandate } from '@/lib/types';
import { formatDate } from '@/lib/formatters';
import { Bot, Plus, Key, ShieldCheck, Activity, Lock, RefreshCw, X } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState('autonomous-procurement');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentRes, manRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/mandates'),
      ]);
      const [aData, mData] = await Promise.all([agentRes.json(), manRes.json()]);
      if (aData.agents) setAgents(aData.agents);
      if (mData.mandates) setMandates(mData.mandates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgentName.trim(),
          type: newAgentType,
          assignedMandateIds: mandates.map(m => m.id),
        }),
      });

      if (res.ok) {
        setNewAgentName('');
        setShowRegister(false);
        fetchData();
      }
    } catch (err) {
      alert('Failed to register agent');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
              Authorized AI Agents
            </h1>
            <p className="text-xs text-[#5E738B] mt-1">
              Connect and govern external autonomous agents via scoped API tokens.
            </p>
          </div>

          <button
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0070E0] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Agent</span>
          </button>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4 hover:border-[#0070E0]/30 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003087]/10 text-[#003087] flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#001C48]">{agent.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF8F0] text-[#0E8A44] uppercase">
                        {agent.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {agent.id}</div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold bg-[#F5F8FC] border border-[#DCE5EF] text-[#5E738B] px-2.5 py-1 rounded-lg">
                  {agent.type}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {agent.description}
              </p>

              {/* Scoped API Token Info */}
              <div className="bg-[#F8FAFD] p-3 rounded-xl border border-[#EEF3F8] space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span className="flex items-center gap-1 font-sans">
                    <Key className="w-3.5 h-3.5 text-[#0070E0]" />
                    API Key Prefix
                  </span>
                  <span className="text-[10px] text-[#0E8A44] font-bold">Scoped Permissions</span>
                </div>
                <div className="text-gray-900 font-semibold">{agent.apiKeyPrefix}••••••••••••</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EEF3F8] text-center text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Proposals</span>
                  <span className="font-bold text-gray-900">{agent.totalProposals}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Rate Limit</span>
                  <span className="font-bold text-gray-900">{agent.rateLimitPerMinute}/min</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Last Active</span>
                  <span className="font-bold text-gray-900">Just now</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register Agent Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-modal border border-[#DCE5EF] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#001C48]">Register External AI Agent</h3>
              <button onClick={() => setShowRegister(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  required
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. TravelBooking Agent v2"
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Agent Capability Type</label>
                <select
                  value={newAgentType}
                  onChange={(e) => setNewAgentType(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs"
                >
                  <option value="autonomous-procurement">Autonomous Procurement</option>
                  <option value="shopping-assistant">Shopping Assistant</option>
                  <option value="travel-booking">Travel & Lodging Booking</option>
                  <option value="saas-provisioning">SaaS Tool Provisioning</option>
                </select>
              </div>

              <div className="p-3 bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl text-[11px] text-[#003087]">
                A scoped API token will be issued. Agent transactions will be restricted strictly to active mandates.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0070E0] hover:bg-[#005ea6] text-white font-bold rounded-xl"
                >
                  Register Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

