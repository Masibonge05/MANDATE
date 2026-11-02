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
            Genuine sandbox connections for PayPal Developer Platform, Gemini AI Reviewer, and Channel3 discovery.
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
                SANDBOX ACTIVE
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              MANDATE interacts with the official PayPal REST Orders API v2 (<code>/v2/checkout/orders</code>) and order capture verification.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#F8FAFD] p-3 rounded-xl border border-[#EEF3F8]">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Environment:</span>
                <span className="text-[#003087]">Sandbox</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Base URL:</span>
                <span className="text-[#0070E0]">https://api-m.sandbox.paypal.com</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Orders API:</span>
                <span className="text-gray-900 font-bold">v2/checkout/orders</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Capture Rail:</span>
                <span className="text-gray-900 font-bold">Server-Side Verified</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-[#5E738B] leading-relaxed">
              <strong className="text-gray-900 block mb-1">Configuration in .env:</strong>
              <code>PAYPAL_CLIENT_ID</code> and <code>PAYPAL_CLIENT_SECRET</code>. When credentials are not provided, MANDATE operates in verifiable sandbox test mode.
            </div>
          </div>

          {/* Card 2: Google Gemini AI Model */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0070E0] text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001C48]">Gemini 2.5 Flash</h3>
                  <span className="text-[10px] text-[#5E738B]">Google DeepMind AI Engine</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8]">
                ENABLED
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Provides dual AI functions: natural language mandate compilation and adversarial prompt injection review in untrusted product listings.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#F8FAFD] p-3 rounded-xl border border-[#EEF3F8]">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Primary Model:</span>
                <span className="text-[#003087]">gemini-2.5-flash</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Output Mode:</span>
                <span className="text-gray-900 font-bold">Strict JSON Schema (Zod)</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Prompt Defense:</span>
                <span className="text-[#0E8A44] font-bold">Active Heuristic + LLM</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-[#5E738B]">
              <strong className="text-gray-900 block mb-1">Provider Abstraction:</strong>
              Configured via <code>GEMINI_API_KEY</code> with zero-downtime offline fallback security guardian.
            </div>
          </div>

          {/* Card 3: Channel3 Product Discovery */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF3F8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center font-bold">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001C48]">Channel3 Discovery Provider</h3>
                  <span className="text-[10px] text-[#5E738B]">Product Search Adapter</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EBF3FC] text-[#0070E0] border border-[#CDE1F8]">
                DEMO CATALOGUE
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Isolated service boundary. Connects to Channel3 API when configured, or serves verified photography demonstration items.
            </p>

            <div className="space-y-2 text-xs font-mono bg-[#F8FAFD] p-3 rounded-xl border border-[#EEF3F8]">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Mode:</span>
                <span className="text-gray-900 font-bold">Sample + Live Adapter</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Sample Items:</span>
                <span className="text-[#0070E0]">7 Verified Photography Items</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-sans font-semibold">Adversarial Test Item:</span>
                <span className="text-[#D92D20] font-bold">Included for Testing</span>
              </div>
            </div>
          </div>

          {/* Card 4: PayPal Webhooks */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
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

            <div className="p-3 bg-[#F8FAFD] rounded-xl border border-[#EEF3F8] text-xs font-mono space-y-1">
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

