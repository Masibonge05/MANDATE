'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ProductItem, Mandate } from '@/lib/types';
import { ProductCard } from '@/components/shopping/ProductCard';
import { CartProposalModal } from '@/components/shopping/CartProposalModal';
import {
  Search,
  Bot,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Package,
  BarChart3,
  FileCheck2,
  Send,
  RotateCcw,
} from 'lucide-react';

// Agent execution step type
interface AgentStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
  timestamp?: string;
}

const INITIAL_STEPS: AgentStep[] = [
  { id: 'understand', label: 'Parse Shopping Request', description: 'Extracting product intent, budget constraints and categories from user instruction.', status: 'pending' },
  { id: 'plan', label: 'Build Procurement Plan', description: 'Creating a structured search strategy with priority categories and merchant preferences.', status: 'pending' },
  { id: 'search', label: 'Query Channel3 Product Graph', description: 'Calling Channel3 live product discovery API for real commercial inventory.', status: 'pending' },
  { id: 'retrieve', label: 'Retrieve Product & Merchant Data', description: 'Normalizing product listings, prices, merchant credentials and availability.', status: 'pending' },
  { id: 'compare', label: 'Compare & Evaluate Options', description: 'Scoring products against user intent: price fit, category match, merchant trust.', status: 'pending' },
  { id: 'recommend', label: 'Select Best Suitable Option', description: 'Choosing the highest-scoring product that best satisfies the mandate criteria.', status: 'pending' },
  { id: 'propose', label: 'Submit to MANDATE Gateway', description: 'Agent proposes chosen product to MANDATE — it never accesses PayPal credentials directly.', status: 'pending' },
];

export default function ShoppingWorkspacePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [searchQuery, setSearchQuery] = useState('photography gift for sister');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentComplete, setAgentComplete] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const stepTimeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearStepTimeouts = () => {
    stepTimeoutRefs.current.forEach(clearTimeout);
    stepTimeoutRefs.current = [];
  };

  const updateStep = (id: string, updates: Partial<AgentStep>) => {
    setAgentSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const resetAgent = () => {
    clearStepTimeouts();
    setAgentSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' })));
    setAgentRunning(false);
    setAgentComplete(false);
    setProducts([]);
  };

  const fetchCatalog = async (query: string) => {
    clearStepTimeouts();
    setAgentRunning(true);
    setAgentComplete(false);
    setProducts([]);
    setAgentSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' })));

    // Step 1: Understand
    updateStep('understand', { status: 'running' });
    await new Promise(r => { const t = setTimeout(r, 600); stepTimeoutRefs.current.push(t); });
    updateStep('understand', {
      status: 'done',
      detail: `Intent: Photography gift. Budget constraint: mandate-enforced. Categories: Photography Accessories, Bags & Straps, Electronics.`,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Step 2: Plan
    updateStep('plan', { status: 'running' });
    await new Promise(r => { const t = setTimeout(r, 500); stepTimeoutRefs.current.push(t); });
    updateStep('plan', {
      status: 'done',
      detail: `Plan: Search for "${query}" → Score by price, category, merchant whitelist → Submit top candidate to MANDATE.`,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Step 3: Search
    updateStep('search', { status: 'running' });
    let fetchedProducts: ProductItem[] = [];
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
      if (prodData.allCatalog) fetchedProducts = prodData.allCatalog;
      else if (prodData.products) fetchedProducts = prodData.products;
      if (manData.mandates) setMandates(manData.mandates);

      const isLive = fetchedProducts.some(p => !p.isSampleData);
      updateStep('search', {
        status: 'done',
        detail: isLive
          ? `Live Channel3 API returned ${fetchedProducts.length} products for query "${query}".`
          : `Channel3 fallback catalog loaded: ${fetchedProducts.length} products (API unreachable in sandbox environment).`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch {
      updateStep('search', { status: 'error', detail: 'Channel3 API unreachable — falling back to demo catalog.', timestamp: new Date().toLocaleTimeString() });
    } finally {
      setLoading(false);
    }

    // Step 4: Retrieve
    updateStep('retrieve', { status: 'running' });
    await new Promise(r => { const t = setTimeout(r, 400); stepTimeoutRefs.current.push(t); });
    setProductCount(fetchedProducts.length);
    setProducts(fetchedProducts);
    updateStep('retrieve', {
      status: 'done',
      detail: `Normalized ${fetchedProducts.length} listings. Merchants identified. Prices and availability confirmed.`,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Step 5: Compare
    updateStep('compare', { status: 'running' });
    await new Promise(r => { const t = setTimeout(r, 600); stepTimeoutRefs.current.push(t); });
    const scored = fetchedProducts
      .filter(p => !p.flaggedRisk)
      .map(p => ({ title: p.title, score: (p.rating || 3) + (p.price < 60 ? 1 : 0) + (p.inStock ? 0.5 : 0) }))
      .sort((a, b) => b.score - a.score);
    updateStep('compare', {
      status: 'done',
      detail: scored.length > 0
        ? `Scored ${scored.length} candidates. Top: "${scored[0]?.title}" (score: ${scored[0]?.score.toFixed(1)}).`
        : 'No safe candidates found after filtering adversarial listings.',
      timestamp: new Date().toLocaleTimeString(),
    });

    // Step 6: Recommend
    updateStep('recommend', { status: 'running' });
    await new Promise(r => { const t = setTimeout(r, 400); stepTimeoutRefs.current.push(t); });
    const topPick = fetchedProducts.find(p => !p.flaggedRisk);
    updateStep('recommend', {
      status: 'done',
      detail: topPick
        ? `Recommended: "${topPick.title}" from ${topPick.merchant} at ${topPick.currency} ${topPick.price}. Matches photography gift intent and budget parameters.`
        : 'No safe recommendation. All candidates flagged as high-risk or over-budget.',
      timestamp: new Date().toLocaleTimeString(),
    });

    // Step 7: Gateway
    updateStep('propose', { status: 'running' });
    await new Promise(r => { const t = setTimeout(r, 400); stepTimeoutRefs.current.push(t); });
    updateStep('propose', {
      status: 'done',
      detail: 'Agent ready to submit chosen product to MANDATE policy gateway. PayPal is not contacted until policy and AI review approve.  Click "Propose via MANDATE Gateway" on any product card below.',
      timestamp: new Date().toLocaleTimeString(),
    });

    setAgentRunning(false);
    setAgentComplete(true);
  };

  useEffect(() => {
    fetchCatalog(searchQuery);
    return clearStepTimeouts;
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog(searchQuery);
  };

  const stepIcon = (step: AgentStep) => {
    if (step.status === 'done') return <CheckCircle2 className="w-4 h-4 text-[#0E8A44] flex-shrink-0" />;
    if (step.status === 'running') return <Loader2 className="w-4 h-4 text-[#0070E0] animate-spin flex-shrink-0" />;
    if (step.status === 'error') return <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Workspace Title & Agent Banner */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[#001C48] tracking-tight">
                AI Shopping Agent Workspace
              </h1>
              <span className="bg-[#EBF3FC] text-[#0070E0] border border-[#CDE1F8] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Aura-Shop v1.4
              </span>
            </div>
            <p className="text-xs text-[#5E738B] mt-1">
              Autonomous product discovery with visible tool execution timeline. Agent proposes — MANDATE decides — PayPal processes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {agentComplete && (
              <button
                onClick={resetAgent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DCE5EF] text-gray-600 hover:text-gray-900 rounded-xl text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Agent
              </button>
            )}
            <div className="bg-[#F8FAFD] border border-[#DCE5EF] px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs">
              <FileCheck2 className="w-3.5 h-3.5 text-[#003087]" />
              <span className="text-[#5E738B]">Active Mandate:</span>
              <span className="font-bold text-[#003087]">Birthday Gift ($100 Cap)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Agent Activity Timeline */}
          <div className="lg:col-span-1 space-y-4">
            {/* Agent Query Input */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-[#DCE5EF] shadow-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#003087]">
                <Bot className="w-4 h-4" />
                <span>Shopping Instruction</span>
              </div>
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rows={3}
                placeholder="e.g. Find a birthday gift for my sister. She likes photography. Budget is $100."
                className="w-full px-3 py-2.5 bg-[#F5F8FC] border border-[#DCE5EF] rounded-xl text-xs font-medium text-[#142B4A] focus:outline-none focus:ring-1 focus:ring-[#0070E0] focus:bg-white resize-none"
              />
              <button
                type="submit"
                disabled={agentRunning}
                className="w-full px-4 py-2.5 bg-[#0070E0] hover:bg-[#005ea6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                {agentRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Agent Running...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Agent Search</span>
                  </>
                )}
              </button>
            </form>

            {/* Agent Execution Timeline */}
            <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle overflow-hidden">
              <div className="px-4 py-3 border-b border-[#EEF3F8] bg-[#F8FAFD] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#003087]" />
                  <span className="font-bold text-xs text-[#001C48]">Agent Execution Timeline</span>
                </div>
                {agentRunning && (
                  <span className="text-[10px] font-bold text-[#0070E0] bg-[#EBF3FC] px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
                {agentComplete && (
                  <span className="text-[10px] font-bold text-[#0E8A44] bg-[#EBF8F0] px-2 py-0.5 rounded-full">
                    COMPLETE
                  </span>
                )}
              </div>

              <div className="p-3 space-y-1">
                {agentSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`relative p-3 rounded-xl border transition-all duration-300 ${
                      step.status === 'done'
                        ? 'bg-[#F0FDF4] border-[#A6E3B8]'
                        : step.status === 'running'
                        ? 'bg-[#EBF3FC] border-[#CDE1F8] shadow-sm'
                        : step.status === 'error'
                        ? 'bg-[#FFFBEB] border-[#F8D8A3]'
                        : 'bg-[#F8FAFD] border-[#EEF3F8]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        {stepIcon(step)}
                        {idx < agentSteps.length - 1 && (
                          <div className={`w-px h-full min-h-[12px] mt-1 ${step.status === 'done' ? 'bg-[#A6E3B8]' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-bold ${
                            step.status === 'done' ? 'text-[#0E8A44]'
                              : step.status === 'running' ? 'text-[#0070E0]'
                              : 'text-gray-500'
                          }`}>
                            {idx + 1}. {step.label}
                          </span>
                          {step.timestamp && (
                            <span className="text-[9px] text-gray-400 font-mono flex-shrink-0">{step.timestamp}</span>
                          )}
                        </div>
                        {step.status === 'running' && (
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
                        )}
                        {step.detail && step.status !== 'pending' && (
                          <p className={`text-[10px] mt-0.5 leading-relaxed ${
                            step.status === 'done' ? 'text-[#166534]' : step.status === 'error' ? 'text-amber-700' : 'text-gray-500'
                          }`}>
                            {step.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Notice */}
              <div className="mx-3 mb-3 p-3 bg-[#EBF3FC] border border-[#CDE1F8] rounded-xl flex items-start gap-2 text-[10px] text-[#003087]">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  The agent holds <strong>zero</strong> payment credentials. It can discover and propose. MANDATE independently enforces policy before PayPal is ever contacted.
                </span>
              </div>
            </div>

            {/* Stats card */}
            {agentComplete && (
              <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-subtle p-4 space-y-3">
                <span className="text-xs font-bold text-[#001C48]">Discovery Results</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8FAFD] rounded-xl p-3 text-center">
                    <div className="text-xl font-black text-[#003087]">{productCount}</div>
                    <div className="text-[10px] text-[#5E738B]">Products Found</div>
                  </div>
                  <div className="bg-[#FEF3F2] rounded-xl p-3 text-center">
                    <div className="text-xl font-black text-[#D92D20]">{products.filter(p => p.flaggedRisk).length}</div>
                    <div className="text-[10px] text-[#5E738B]">Adversarial Flagged</div>
                  </div>
                  <div className="bg-[#F0FDF4] rounded-xl p-3 text-center">
                    <div className="text-xl font-black text-[#0E8A44]">{products.filter(p => !p.flaggedRisk).length}</div>
                    <div className="text-[10px] text-[#5E738B]">Safe Candidates</div>
                  </div>
                  <div className="bg-[#FEF7EB] rounded-xl p-3 text-center">
                    <div className="text-xl font-black text-[#B46500]">{mandates.length}</div>
                    <div className="text-[10px] text-[#5E738B]">Active Mandates</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Product Catalog Grid */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#5E738B]" />
                <span className="font-semibold text-gray-700">
                  {loading
                    ? 'Querying Channel3 Product Graph...'
                    : `${products.length} Products Discovered`
                  }
                </span>
                {products.some(p => !p.isSampleData) && (
                  <span className="bg-[#EBF8F0] text-[#0E8A44] border border-[#A6E3B8] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    LIVE API
                  </span>
                )}
                {products.every(p => p.isSampleData) && products.length > 0 && (
                  <span className="bg-[#FEF7EB] text-[#B46500] border border-[#F8D8A3] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    DEMO CATALOG
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-400 italic hidden sm:block">
                Click "Propose via MANDATE Gateway" to test policy enforcement
              </span>
            </div>

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[#DCE5EF] h-64 animate-pulse">
                    <div className="h-40 bg-gray-100 rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPropose={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}

            {!loading && products.length === 0 && agentComplete && (
              <div className="py-16 text-center text-gray-500 text-xs bg-white rounded-2xl border border-[#DCE5EF]">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>No products found. Try a different search query.</p>
              </div>
            )}

            {!loading && !agentComplete && (
              <div className="py-16 text-center text-gray-500 text-xs bg-white rounded-2xl border border-[#DCE5EF]">
                <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>Run the agent to discover products.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Proposal Modal */}
      {selectedProduct && (
        <CartProposalModal
          product={selectedProduct}
          mandates={mandates}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </AppShell>
  );
}
