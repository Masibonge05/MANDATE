import React from 'react';

interface MandateLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const MandateLogo: React.FC<MandateLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Restrained fintech security shield & check symbol */}
      <div className={`${iconSizes[size]} rounded-lg bg-gradient-to-br from-[#003087] to-[#0070E0] flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-[#001C48] ${textSizes[size]}`}>
            MANDATE
          </span>
          <span className="text-[10px] font-semibold bg-[#EBF3FC] text-[#0070E0] px-1.5 py-0.5 rounded border border-[#CDE1F8] tracking-wider uppercase">
            GATEWAY
          </span>
        </div>
        {showSubtitle && size !== 'sm' && (
          <span className="text-[11px] text-[#5E738B] font-medium tracking-tight">
            Financial Control for AI Agents
          </span>
        )}
      </div>
    </div>
  );
};

