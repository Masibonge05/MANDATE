'use client';

import React from 'react';
import { ProductItem } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import { Building2, Tag, Star, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  onPropose: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPropose }) => {
  const isMalicious = product.flaggedRisk;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-subtle hover:shadow-card ${
      isMalicious ? 'border-[#F9A8A4] ring-1 ring-[#D92D20]/20' : 'border-[#DCE5EF] hover:border-[#0070E0]/50'
    }`}>
      {/* Product Image & Badges */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="bg-white/90 backdrop-blur-xs text-[#142B4A] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-white/50">
            {product.category}
          </span>
          {isMalicious && (
            <span className="bg-[#D92D20] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              ADVERSARIAL TEST LISTING
            </span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-[#003087] text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-sm">
            {formatCurrency(product.price, product.currency)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] text-[#5E738B]">
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-semibold">{product.merchant}</span>
            {product.rating && (
              <span className="ml-auto flex items-center gap-0.5 text-amber-600 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {product.rating}
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm text-[#001C48] leading-snug line-clamp-2">
            {product.title}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Attributes Preview if present */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="pt-2 border-t border-[#EEF3F8] grid grid-cols-2 gap-1 text-[10px] text-gray-500">
            {Object.entries(product.attributes).slice(0, 2).map(([k, v], idx) => (
              <div key={idx} className="truncate">
                <span className="font-semibold text-gray-700">{k}:</span> {v}
              </div>
            ))}
          </div>
        )}

        {/* Action Button: Agent Proposes to MANDATE Gateway */}
        <div className="pt-2 border-t border-[#EEF3F8]">
          <button
            onClick={() => onPropose(product)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs ${
              isMalicious
                ? 'bg-[#FEF3F2] border border-[#F9A8A4] text-[#D92D20] hover:bg-[#FEE4E2]'
                : 'bg-[#0070E0] hover:bg-[#005ea6] text-white'
            }`}
          >
            <span>Propose via MANDATE Gateway</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

