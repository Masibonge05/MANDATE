'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  Bot,
  ShoppingBag,
  UserCheck,
  ShieldAlert,
  BarChart3,
  PlugZap,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { MandateLogo } from '../common/MandateLogo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mandate Studio', href: '/mandates', icon: FileCheck2 },
  { name: 'AI Agents', href: '/agents', icon: Bot },
  { name: 'Shopping Workspace', href: '/shopping', icon: ShoppingBag },
  { name: 'Approval Centre', href: '/approvals', icon: UserCheck },
  { name: 'Security Ledger', href: '/ledger', icon: ShieldAlert },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Integrations', href: '/integrations', icon: PlugZap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[#DCE5EF] flex flex-col h-full flex-shrink-0 z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#EEF3F8]">
        <Link href="/dashboard" className="focus:outline-none">
          <MandateLogo size="md" />
        </Link>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#5E738B] tracking-wider uppercase">
          Financial Control Core
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#EBF3FC] text-[#003087] font-semibold'
                  : 'text-[#475467] hover:bg-[#F5F8FC] hover:text-[#142B4A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#0070E0]' : 'text-[#8296A8]'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF3FC] text-[#0070E0]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Security Status Box */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-[#F8FAFD] border border-[#E2E8F0] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#142B4A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0E8A44] animate-pulse" />
            Gateway Active
          </span>
          <span className="text-[10px] text-[#5E738B]">Sandbox v2</span>
        </div>
        <p className="text-[11px] text-[#5E738B] leading-relaxed">
          Deterministic checks and AI Risk Review enforcing spending boundaries.
        </p>
      </div>

      {/* Footer Profile Preview */}
      <div className="p-4 border-t border-[#EEF3F8] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-bold text-xs">
            ER
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#142B4A]">Elena Rostova</span>
            <span className="text-[10px] text-[#5E738B]">Lumina Studios</span>
          </div>
        </div>
        <Link href="/settings" title="Account settings" className="text-[#8296A8] hover:text-[#003087]">
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
};

