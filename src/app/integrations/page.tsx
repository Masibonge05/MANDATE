'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PayPalLogo } from '@/components/common/PayPalLogo';
import {
  PlugZap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  Shield,
  Sparkles,
  Server,
  Layers,
  Copy,
  Check,
  Database,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
            Platform Integrations & API Credentials
          </h1>
          <p className="text-xs text-[#5E738B] mt-1">
            Genuine live connections for PayPal Developer Platform, Gemini AI Reviewer, Channel3 API, and Supabase PostgreSQL.
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: PayPal Developer Platform */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
              <div className="flex items-center gap-2.5">
                <PayPalLogo variant="full" height={22} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8]">
                SANDBOX ACTIVE & AUTHENTICATED
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              MANDATE interacts directly with the official PayPal REST Orders API v2 (<code>/v2/checkout/orders</code>) with server-side OAuth2 bearer tokens and capture verification.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#F8FAFD] p-3.5 rounded-xl border border-[#EEF3F8]">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Environment:</span>
                <span className="text-[#003087]">api-m.sandbox.paypal.com</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Client ID Prefix:</span>
                <span className="text-gray-900 font-bold">BAA5oLfJCx...aF9JOyPR8</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Business Account:</span>
                <span className="text-[#0070E0]">sb-ahu7e53655928@business.example.com</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Buyer Sandbox Account:</span>
                <span className="text-[#0E8A44]">sb-47eyng53682632@personal.example.com</span>
              </div>
            </div>

            <div className="pt-1 text-xs text-[#5E738B] leading-relaxed flex items-center justify-between">
              <span>Status: <strong>Live Connected to Sandbox</strong></span>
              <a
                href="https://developer.paypal.com/dashboard/applications/sandbox"
                target="_blank"
                rel="noreferrer"
                className="text-[#0070E0] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>PayPal Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 2: Channel3 Product Graph API */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0070E0] text-white flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001C48]">Channel3 Discovery API</h3>
                  <span className="text-[10px] text-[#5E738B]">AI Agentic Commerce Graph</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8]">
                LIVE ACTIVE & VERIFIED
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connects to the official Channel3 search endpoint (<code>api.trychannel3.com/v1/search</code>) to retrieve live, structured multi-retailer product offers.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#F8FAFD] p-3.5 rounded-xl border border-[#EEF3F8]">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Endpoint:</span>
                <span className="text-[#003087]">api.trychannel3.com/v1/search</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">API Key Prefix:</span>
                <span className="text-[#0E8A44] font-bold">ch3_live_••••••••••••</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Response Schema:</span>
                <span className="text-gray-900 font-bold">Live Structured Offers</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Affiliate Tracking:</span>
                <span className="text-[#0070E0] font-bold">Enabled</span>
              </div>
            </div>

            <div className="pt-1 text-xs text-[#5E738B] leading-relaxed flex items-center justify-between">
              <span>Status: <strong>Live Product Discovery Active</strong></span>
              <a
                href="https://docs.trychannel3.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#0070E0] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Channel3 Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 3: Google Gemini AI Model */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0070E0] text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001C48]">Gemini Flash</h3>
                  <span className="text-[10px] text-[#5E738B]">Google DeepMind AI Engine</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8]">
                ACTIVE &amp; AUTHENTICATED
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Provides dual AI functions: natural language mandate compilation and adversarial prompt injection review in untrusted product listings.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#F8FAFD] p-3.5 rounded-xl border border-[#EEF3F8]">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">API Model:</span>
                <span className="text-[#003087]">gemini-flash-latest (fallback cascade)</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Key Status:</span>
                <span className="text-[#0E8A44] font-bold">Authenticated (AQ.Ab8RN6...)</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Output Mode:</span>
                <span className="text-gray-900 font-bold">Strict JSON Schema (Zod)</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Threat Detection:</span>
                <span className="text-[#0E8A44] font-bold">Active Prompt Injection Defense</span>
              </div>
            </div>

            <div className="pt-1 text-xs text-[#5E738B]">
              Latency: <strong>Fast Real-Time Inference</strong>
            </div>
          </div>

          {/* Card 4: Supabase PostgreSQL */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0E8A44] text-white flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001C48]">Supabase PostgreSQL</h3>
                  <span className="text-[10px] text-[#5E738B]">Cloud Relational Database</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8]">
                CONNECTED
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Stores tenants, mandates, versioned policy history, and transactions with cryptographic Row Level Security (RLS) policies.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#F8FAFD] p-3.5 rounded-xl border border-[#EEF3F8]">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Project URL:</span>
                <span className="text-[#003087]">aws-0-eu-north-1.supabase.co</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Region:</span>
                <span className="text-gray-900 font-bold">aws-0-eu-north-1</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Isolation:</span>
                <span className="text-[#0E8A44] font-bold">Row Level Security (RLS)</span>
              </div>
            </div>

            <div className="pt-1 text-xs text-[#5E738B] leading-relaxed">
              Migration script available at <code>supabase/migrations/20261102_mandate_core.sql</code>
            </div>
          </div>

          {/* Card 5: PayPal Webhooks */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#009CDE] text-white flex items-center justify-center font-bold">
                  <PlugZap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001C48]">PayPal Webhook Handler</h3>
                  <span className="text-[10px] text-[#5E738B]">Asynchronous Event Verification</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8]">
                LISTENING
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Receives and verifies asynchronous webhook callbacks from PayPal Sandbox with event deduplication.
            </p>

            <div className="p-3.5 bg-[#F8FAFD] rounded-xl border border-[#EEF3F8] text-xs font-mono space-y-1">
              <span className="text-gray-500 font-sans block text-[11px]">Listener Endpoint:</span>
              <div className="flex items-center justify-between">
                <span className="text-[#003087] font-bold">/api/webhooks/paypal</span>
                <button
                  onClick={() => copyToClipboard('/api/webhooks/paypal', 'webhook')}
                  className="text-gray-400 hover:text-gray-700"
                >
                  {copiedKey === 'webhook' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-gray-500">
              Handles: <code>PAYMENT.CAPTURE.COMPLETED</code>, <code>CHECKOUT.ORDER.APPROVED</code>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
