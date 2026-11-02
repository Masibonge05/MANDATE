'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProductItem, Mandate } from '@/lib/types';
import { ProductCard } from '@/components/shopping/ProductCard';
import { CartProposalModal } from '@/components/shopping/CartProposalModal';
import { Search, Bot, Sparkles, Filter, AlertTriangle, Layers, SlidersHorizontal } from 'lucide-react';

export default function ShoppingWorkspacePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [searchQuery, setSearchQuery] = useState('photography gift');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const fetchCatalog = async (query: string) => {
    try {
      setLoading(true);
      const [prodRes, manRes] = await Promise.all([
        fetch(`/api/products?q=${encodeURIComponent(query)}`),
        fetch('/api/mandates'),
      ]);

      const [prodData, manData] = await Promise.all([
        prodRes.json(),
        manRes.json(),
      ]);

      if (prodData.allCatalog) setProducts(prodData.allCatalog);
      else if (prodData.products) setProducts(prodData.products);
      if (manData.mandates) setMandates(manData.mandates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog(searchQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog(searchQuery);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Workspace Title & Agent Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
                AI Shopping Agent Workspace
              </h1>
              <span className="bg-[#EBF3FC] text-[#0070E0] border border-[#CDE1F8] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Aura-Shop v1.4
              </span>
            </div>
            <p className="text-xs text-[#5E738B] mt-1">
              Autonomous discovery & cart construction. Agent proposes transactions; MANDATE enforces policy.
            </p>
          </div>

          <div className="bg-[#F8FAFD] border border-[#DCE5EF] px-3.5 py-2 rounded-xl flex items-center gap-3 text-xs">
            <span className="text-[#5E738B]">Connected Mandate:</span>
            <span className="font-bold text-[#003087]">Birthday Gift ($100 Cap)</span>
          </div>
        </div>

        {/* Agent Query Input Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-[#DCE5EF] shadow-subtle flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Bot className="w-5 h-5 text-[#0070E0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Find a birthday gift for my sister. She likes photography. Budget is $100."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F5F8FC] border border-[#DCE5EF] rounded-xl text-xs font-medium text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#0070E0] focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0070E0] hover:bg-[#005ea6] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Search & Source Products</span>
          </button>
        </form>

        {/* Active Catalog Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#5E738B]">
            <span className="font-semibold text-gray-700">
              Discovered Products ({products.length} items available)
            </span>
            <span className="text-[11px] italic">
              Click &quot;Propose via MANDATE Gateway&quot; on any item to test deterministic + AI reviewer enforcement
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPropose={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Cart Proposal Modal */}
      {selectedProduct && (
        <CartProposalModal
          product={selectedProduct}
          mandates={mandates}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            fetchCatalog(searchQuery);
          }}
        />
      )}
    </AppShell>
  );
}

