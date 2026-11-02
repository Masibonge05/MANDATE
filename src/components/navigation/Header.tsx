'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Shield, ExternalLink, Menu, X, Plus } from 'lucide-react';
import { PayPalLogo } from '../common/PayPalLogo';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ledger?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#DCE5EF] px-4 md:px-8 flex items-center justify-between z-10">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-gray-500 hover:text-gray-700"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* Global Quick Search for Transactions / Merch */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, merchants, mandates..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5F8FC] border border-[#DCE5EF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0070E0] focus:bg-white text-[#142B4A]"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Official PayPal Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#F5F8FC] border border-[#DCE5EF] rounded-lg">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5E738B]">Integrated with</span>
          <PayPalLogo variant="full" height={16} />
          <span className="text-[10px] bg-[#EBF3FC] text-[#0070E0] font-bold px-1.5 py-0.5 rounded ml-1">Sandbox</span>
        </div>

        {/* Quick New Mandate */}
        <Link
          href="/mandates?create=true"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0070E0] hover:bg-[#005ea6] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Mandate</span>
        </Link>

        {/* Audit Notification link */}
        <Link
          href="/ledger"
          title="Security Ledger"
          className="p-2 text-gray-500 hover:text-[#003087] hover:bg-[#F5F8FC] rounded-lg relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0070E0]" />
        </Link>
      </div>
    </header>
  );
};

