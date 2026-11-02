import React from 'react';
import Link from 'next/link';
import { MandateLogo } from '@/components/common/MandateLogo';
import { PayPalLogo } from '@/components/common/PayPalLogo';
import {
  ShieldCheck,
  Bot,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  FileCheck2,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#142B4A] flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-[#001C48] text-white text-xs py-2 px-4 text-center font-medium border-b border-[#003087] flex items-center justify-center gap-2">
        <span className="bg-[#0070E0] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          PayPal AI Hackathon 2026
        </span>
        <span className="text-gray-300">
          Official Entry: The Financial Authorization & Security Layer for Autonomous Agents
        </span>
      </div>

      {/* Main Navigation */}
      <header className="bg-white border-b border-[#DCE5EF] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/">
            <MandateLogo size="lg" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#475467]">
            <a href="#how-it-works" className="hover:text-[#003087] transition">How It Works</a>
            <a href="#security-model" className="hover:text-[#003087] transition">Dual Security Model</a>
            <a href="#paypal-integration" className="hover:text-[#003087] transition">PayPal Integration</a>
            <Link href="/ledger" className="hover:text-[#003087] transition">Security Ledger</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#0070E0] hover:bg-[#005ea6] text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3FC] border border-[#CDE1F8] text-[#003087] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#0070E0]" />
          <span>Independent Authorization Gateway Between AI Agents & Payment Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#001C48] tracking-tight max-w-4xl mx-auto leading-tight">
          Let AI agents transact. <br />
          <span className="text-[#0070E0]">You decide what they are authorised to spend.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#5E738B] max-w-2xl mx-auto leading-relaxed">
          MANDATE solves the AI agent financial risk dilemma. Natural language financial permissions convert into structured, deterministic spending policies before any proposal can reach PayPal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#003087] hover:bg-[#001C48] text-white font-bold text-base rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Open Financial Console</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/shopping"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#DCE5EF] hover:bg-[#F8FAFD] text-[#003087] font-bold text-base rounded-xl transition shadow-xs flex items-center justify-center gap-2"
          >
            <Bot className="w-5 h-5 text-[#0070E0]" />
            <span>Test Autonomous Agent</span>
          </Link>
        </div>

        {/* Integration Credentials Bar */}
        <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-[#5E738B] border-t border-[#DCE5EF]/60 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <PayPalLogo variant="full" height={20} />
            <span className="text-gray-400">|</span>
            <span className="text-[#003087]">Developer Platform Sandbox</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E8A44]" />
            <span>Gemini 2.5 Flash Reviewer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E8A44]" />
            <span>AG Grid Audit Ledger</span>
          </div>
        </div>
      </section>

      {/* Value Pillars: The Problem & The MANDATE Solution */}
      <section id="how-it-works" className="py-16 bg-white border-y border-[#DCE5EF]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001C48]">
              The Autonomous Financial Risk Dilemma
            </h2>
            <p className="text-sm text-[#5E738B]">
              Giving an external AI agent raw API keys or open credit access is an unacceptable business risk. MANDATE introduces the zero-trust governance layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base text-[#001C48]">1. Natural Language Mandates</h3>
              <p className="text-xs text-[#5E738B] leading-relaxed">
                Define exact bounds in ordinary prose: budget limits, approved merchants, allowed categories, and expiration dates.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0070E0] text-white flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base text-[#001C48]">2. Deterministic Gateway</h3>
              <p className="text-xs text-[#5E738B] leading-relaxed">
                Strict code enforces budgets and whitelists mathematically. No LLM hallucination can bypass monetary restrictions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#009CDE] text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-base text-[#001C48]">3. PayPal Sandbox Execution</h3>
              <p className="text-xs text-[#5E738B] leading-relaxed">
                Only validated, policy-compliant transactions trigger PayPal sandbox orders. Buyer retains final checkout approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Security Model Section */}
      <section id="security-model" className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0] bg-[#EBF3FC] px-3 py-1 rounded-full">
            Defense in Depth
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001C48]">
            The Two-Layer Security Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[#5E738B]">
            MANDATE completely separates mathematical rules from contextual threat assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Layer 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003087]/10 text-[#003087] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#003087]">Layer 1</span>
                <h3 className="font-bold text-lg text-[#001C48]">Deterministic Policy Engine</h3>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pure deterministic TypeScript rules. Evaluates atomic budget reservations in integer cents, whitelist compliance, category restrictions, quantity ceilings, and expiry timestamps.
            </p>
            <div className="bg-[#F8FAFD] p-3 rounded-xl border border-[#EEF3F8] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#0E8A44]" />
                <span>Zero floating-point rounding errors</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#0E8A44]" />
                <span>Cannot be manipulated by conversational prompts</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#0E8A44]" />
                <span>Atomic budget reservation prevents double-spending</span>
              </div>
            </div>
          </div>

          {/* Layer 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0070E0]/10 text-[#0070E0] flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0070E0]">Layer 2</span>
                <h3 className="font-bold text-lg text-[#001C48]">AI Risk & Injection Reviewer</h3>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Powered by Gemini 2.5 Flash with structured Zod schema output. Inspects untrusted external merchant product descriptions for adversarial prompt injection payloads and intent drift.
            </p>
            <div className="bg-[#F8FAFD] p-3 rounded-xl border border-[#EEF3F8] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#0E8A44]" />
                <span>Neutralizes embedded instructions in product descriptions</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#0E8A44]" />
                <span>Flags pricing anomalies and merchant impersonation</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#0E8A44]" />
                <span>Escalates ambiguous purchases to Human Approval</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official PayPal Sandbox Section */}
      <section id="paypal-integration" className="py-16 bg-[#001C48] text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PayPalLogo variant="full" height={24} className="brightness-0 invert" />
              <span className="text-xs font-bold text-[#009CDE] uppercase tracking-wider">Official Integration</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Genuine PayPal Sandbox Operations
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              MANDATE performs authenticated server-side calls against the PayPal Orders API v2. When a transaction is authorized, MANDATE generates a verified PayPal order, guides the buyer through the standard approval experience, and performs secure capture verification.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2 text-[#A6E3B8]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Server-side OAuth2 authentication</span>
              </div>
              <div className="flex items-center gap-2 text-[#A6E3B8]">
                <CheckCircle2 className="w-4 h-4" />
                <span>v2/checkout/orders API</span>
              </div>
              <div className="flex items-center gap-2 text-[#A6E3B8]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Webhook verification & capture</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-gray-300">Live API Health</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0E8A44] text-white">
                ONLINE
              </span>
            </div>
            <div className="font-mono text-xs space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Endpoint:</span>
                <span className="text-white">api-m.sandbox.paypal.com</span>
              </div>
              <div className="flex justify-between">
                <span>Orders API:</span>
                <span className="text-white">v2/checkout/orders</span>
              </div>
              <div className="flex justify-between">
                <span>Idempotency:</span>
                <span className="text-[#009CDE]">PayPal-Request-Id</span>
              </div>
            </div>
            <Link
              href="/integrations"
              className="w-full py-2.5 px-4 bg-white text-[#001C48] hover:bg-gray-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>View Integration Settings & Keys</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-[#DCE5EF] py-8 px-6 text-xs text-[#5E738B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MandateLogo size="sm" showSubtitle={false} />
            <span>• Built for the PayPal AI Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-[#003087]">Dashboard</Link>
            <Link href="/ledger" className="hover:text-[#003087]">Audit Ledger</Link>
            <Link href="/integrations" className="hover:text-[#003087]">Integrations</Link>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
