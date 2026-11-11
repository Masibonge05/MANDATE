import React from 'react';
import Image from 'next/image';

interface PayPalLogoProps {
  className?: string;
  variant?: 'full' | 'monogram' | 'image' | 'stacked';
  height?: number;
}

/**
 * Official PayPal brand logo component.
 * Supports horizontal vector glyphs, monogram, and high-definition raster assets.
 */
export const PayPalLogo: React.FC<PayPalLogoProps> = ({
  className = '',
  variant = 'full',
  height = 24,
}) => {
  if (variant === 'image' || variant === 'stacked') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Image
          src="/images/paypal-logo.png"
          alt="PayPal"
          width={height}
          height={height}
          priority
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === 'monogram') {
    return (
      <svg
        height={height}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="PayPal Monogram"
      >
        <path
          d="M28.5 110L42.8 19.3H72.4C87.4 19.3 97.4 28.5 94.8 45.4C90.7 71.9 74.4 83.7 54.3 83.7H38.2L34.1 110H28.5Z"
          fill="#0079C1"
        />
        <path
          d="M14.5 119L28.8 28.3H58.4C73.4 28.3 83.4 37.5 80.8 54.4C76.7 80.9 60.4 92.7 40.3 92.7H24.2L20.1 119H14.5Z"
          fill="#00457C"
        />
        <path
          d="M38.2 83.7L42.8 54.4C44 46.7 48.9 41.5 56.6 41.5H62.9C72.2 41.5 78.4 46.6 77 56.2C73.9 76.5 61.2 83.7 46.8 83.7H38.2Z"
          fill="#0079C1"
          fillOpacity="0.6"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        height={height}
        viewBox="0 0 320 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PayPal Logo"
      >
        {/* Official PayPal Monogram */}
        <g transform="translate(0, 0) scale(0.65)">
          <path
            d="M34.5 110L48.8 19.3H78.4C93.4 19.3 103.4 28.5 100.8 45.4C96.7 71.9 80.4 83.7 60.3 83.7H44.2L40.1 110H34.5Z"
            fill="#0079C1"
          />
          <path
            d="M20.5 119L34.8 28.3H64.4C79.4 28.3 89.4 37.5 86.8 54.4C82.7 80.9 66.4 92.7 46.3 92.7H30.2L26.1 119H20.5Z"
            fill="#00457C"
          />
          <path
            d="M44.2 83.7L48.8 54.4C50 46.7 54.9 41.5 62.6 41.5H68.9C78.2 41.5 84.4 46.6 83 56.2C79.9 76.5 67.2 83.7 52.8 83.7H44.2Z"
            fill="#002C6C"
            fillOpacity="0.4"
          />
        </g>
        {/* Official PayPal Wordmark */}
        <text
          x="82"
          y="56"
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="800"
          fontStyle="italic"
          fontSize="48"
          letterSpacing="-1.5"
        >
          <tspan fill="#003087">Pay</tspan>
          <tspan fill="#0070E0">Pal</tspan>
        </text>
      </svg>
    </div>
  );
};

