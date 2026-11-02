/**
 * MANDATE - Formatting & UI Utilities
 */

import { Currency, TransactionLifecycleStatus, RiskLevel } from './types';

export function formatCurrency(amount: number, currency: Currency | string = 'USD'): string {
  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
  };
  const sym = symbolMap[currency.toUpperCase()] || '$';
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getStatusBadgeStyle(status: TransactionLifecycleStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case 'PAID':
      return { bg: 'bg-[#EBF8F0] border border-[#A6E3B8]', text: 'text-[#0E8A44]', label: 'PAID' };
    case 'APPROVED':
      return { bg: 'bg-[#EBF8F0] border border-[#A6E3B8]', text: 'text-[#0E8A44]', label: 'APPROVED' };
    case 'REQUIRES_APPROVAL':
      return { bg: 'bg-[#FEF7EB] border border-[#F8D8A3]', text: 'text-[#B46500]', label: 'REQUIRES APPROVAL' };
    case 'BLOCKED':
      return { bg: 'bg-[#FEF3F2] border border-[#F9A8A4]', text: 'text-[#D92D20]', label: 'BLOCKED' };
    case 'REJECTED':
      return { bg: 'bg-[#F2F4F7] border border-[#D0D5DD]', text: 'text-[#475467]', label: 'REJECTED' };
    case 'PROPOSED':
    case 'UNDER_REVIEW':
      return { bg: 'bg-[#F0F9FF] border border-[#B9E6FE]', text: 'text-[#026AA2]', label: status };
    case 'PAYMENT_PENDING':
      return { bg: 'bg-[#FEF7EB] border border-[#F8D8A3]', text: 'text-[#B46500]', label: 'PAYMENT PENDING' };
    default:
      return { bg: 'bg-gray-100 border border-gray-200', text: 'text-gray-700', label: status };
  }
}

export function getRiskBadgeStyle(risk: RiskLevel): { bg: string; text: string } {
  switch (risk) {
    case 'LOW':
      return { bg: 'bg-[#EBF8F0]', text: 'text-[#0E8A44]' };
    case 'MEDIUM':
      return { bg: 'bg-[#FEF7EB]', text: 'text-[#B46500]' };
    case 'HIGH':
      return { bg: 'bg-[#FEF3F2]', text: 'text-[#D92D20]' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

