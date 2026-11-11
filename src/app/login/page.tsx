'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MandateLogo } from '@/components/common/MandateLogo';
import { PayPalLogo } from '@/components/common/PayPalLogo';
import { ShieldCheck, ArrowRight, ArrowLeft, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('elena.rostova@luminastudios.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setEmail('elena.rostova@luminastudios.com');
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena.rostova@luminastudios.com' }),
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <MandateLogo size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
            Sign in to MANDATE
          </h2>
          <p className="text-xs text-[#5E738B]">
            Financial authorization console for autonomous AI agents
          </p>
        </div>

        {/* Demo Fast Track Card for Hackathon Judges */}
        <div className="bg-[#EBF3FC] border border-[#CDE1F8] rounded-2xl p-4 space-y-2.5 text-xs text-[#003087]">
          <div className="flex items-center gap-2 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-[#0070E0]" />
            <span>Hackathon Evaluation Fast-Track</span>
          </div>
          <p className="text-[11px] text-gray-700 leading-relaxed">
            Click below to instantly sign in as pre-seeded financial admin <strong>Elena Rostova</strong> (Lumina Creative Studios).
          </p>
          <button
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-[#003087] hover:bg-[#001C48] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <span>One-Click Demo Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#0070E0]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFD] border border-[#DCE5EF] rounded-xl text-xs text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#0070E0]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0070E0] hover:bg-[#005ea6] text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Sign In to Platform
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-gray-500">
          <Link href="/" className="hover:text-[#003087] inline-flex items-center gap-1 font-medium transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

