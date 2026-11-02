'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { User, Building2, Shield, Lock, Bell, Check, Save } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('Elena Rostova');
  const [email, setEmail] = useState('elena.rostova@luminastudios.com');
  const [businessName, setBusinessName] = useState('Lumina Creative Studios Inc.');
  const [role, setRole] = useState('VP of Product Operations');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
            Account & Security Settings
          </h1>
          <p className="text-xs text-[#5E738B] mt-1">
            Manage authenticated user profile, business organization, and autonomous agent governance.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEF3F8]">
              <User className="w-5 h-5 text-[#0070E0]" />
              <h3 className="font-bold text-sm text-[#001C48]">Personal Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs font-medium text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs font-medium text-[#142B4A]"
                />
              </div>
            </div>
          </div>

          {/* Business Organization */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEF3F8]">
              <Building2 className="w-5 h-5 text-[#0070E0]" />
              <h3 className="font-bold text-sm text-[#001C48]">Business Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs font-medium text-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs font-medium text-[#142B4A]"
                />
              </div>
            </div>
          </div>

          {/* Security Governance Card */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EEF3F8]">
              <Shield className="w-5 h-5 text-[#0070E0]" />
              <h3 className="font-bold text-sm text-[#001C48]">Data Isolation & Security</h3>
            </div>

            <div className="bg-[#F8FAFD] p-4 rounded-xl border border-[#EEF3F8] text-xs space-y-2 text-gray-600">
              <div className="font-bold text-[#003087]">Database-Level Row Level Security (RLS)</div>
              <p className="leading-relaxed">
                All mandates, agent credentials, proposals, and PayPal order references are cryptographically isolated per user tenant. Agents can only access mandates explicitly granted to their registered token.
              </p>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between">
            {saved ? (
              <span className="text-xs text-[#0E8A44] font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Settings updated successfully
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#003087] hover:bg-[#001C48] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Account Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

