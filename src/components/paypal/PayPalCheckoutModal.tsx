'use client';

import React, { useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';
import { PayPalLogo } from '../common/PayPalLogo';
import { X, CheckCircle2, ShieldCheck, AlertCircle, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';

interface PayPalCheckoutModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  transaction,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'review' | 'approving' | 'capturing' | 'success'>('review');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captureDetails, setCaptureDetails] = useState<any>(null);

  const handleCompletePayment = async () => {
    try {
      setStep('capturing');
      setErrorMessage(null);

      const orderId = transaction.paypalOrderId || `SANDBOX-ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Call server-side PayPal order capture endpoint
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          transactionId: transaction.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server-side capture failed');
      }

      setCaptureDetails(data.capture);
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2500);

    } catch (err: any) {
      console.error('[PayPal Modal Capture Error]:', err);
      setErrorMessage(err.message || 'Payment execution failed');
      setStep('review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#DCE5EF] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Official PayPal Branding */}
        <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="bg-white px-2.5 py-1 rounded-lg flex items-center shadow-xs">
              <PayPalLogo variant="full" height={18} />
            </div>
            <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded tracking-wider uppercase">
              Sandbox
            </span>
          </div>
          {step !== 'capturing' && (
            <button onClick={onClose} className="text-white/70 hover:text-white transition p-1 rounded-lg hover:bg-white/10" aria-label="Close dialog">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-[#142B4A]">
          {step === 'review' && (
            <>
              {/* Security Gate Confirmation */}
              <div className="bg-[#EBF8F0] border border-[#A6E3B8] rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#0E8A44] flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-[#0E8A44]">MANDATE Policy Pre-Authorization Verified</div>
                  <div className="text-gray-600 mt-0.5">
                    This transaction strictly conforms to policy "{transaction.mandateName}" ($100 budget, approved category & merchant).
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border border-[#DCE5EF] rounded-xl p-4 bg-[#F8FAFD] space-y-3 text-xs">
                <div className="flex justify-between items-center text-[#5E738B]">
                  <span>Item Description</span>
                  <span className="font-semibold text-gray-900">{transaction.product.title}</span>
                </div>
                <div className="flex justify-between items-center text-[#5E738B]">
                  <span>Merchant</span>
                  <span className="font-semibold text-gray-900">{transaction.product.merchant}</span>
                </div>
                <div className="flex justify-between items-center text-[#5E738B]">
                  <span>PayPal Order Reference</span>
                  <span className="font-mono text-[#003087] font-semibold">{transaction.paypalOrderId || 'GENERATING...'}</span>
                </div>
                <div className="border-t border-[#DCE5EF] pt-2 flex justify-between items-baseline font-bold text-sm">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#003087]">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </span>
                </div>
              </div>

              {/* Sandbox Notice & Buyer Account Hint */}
              <div className="bg-[#F5F8FC] p-3 rounded-xl border border-[#DCE5EF] text-[11px] text-[#5E738B] leading-relaxed space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-gray-900">PayPal Sandbox Environment</strong>
                  <span className="text-[10px] bg-[#EBF3FC] text-[#0070E0] font-bold px-1.5 py-0.5 rounded">Live Sandbox</span>
                </div>
                <div>All payments execute in the PayPal Sandbox test network. No real funds are debited.</div>
                <div className="pt-1 text-[10px] text-gray-700 font-mono bg-white p-1.5 rounded border border-[#EEF3F8]">
                  <span className="font-sans font-semibold text-[#003087]">Personal Buyer Account: </span>
                  sb-47eyng53682632@personal.example.com
                </div>
              </div>

              {errorMessage && (
                <div className="bg-[#FEF3F2] border border-[#F9A8A4] text-[#D92D20] p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCompletePayment}
                  className="w-full py-3 px-4 bg-[#0070E0] hover:bg-[#005ea6] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>Authorize & Capture with PayPal Sandbox</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {transaction.paypalApprovalUrl && (
                  <a
                    href={transaction.paypalApprovalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-white border border-[#DCE5EF] hover:bg-[#F8FAFD] text-gray-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>Open External PayPal Sandbox Window</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                )}
              </div>
            </>
          )}

          {step === 'capturing' && (
            <div className="py-10 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#0070E0] animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-base text-[#001C48]">
                  Capturing Payment on PayPal Sandbox...
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Transacting via server-side PayPal REST v2 API and verifying idempotency.
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-[#EBF8F0] rounded-full flex items-center justify-center text-[#0E8A44] mx-auto border-2 border-[#A6E3B8]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#0E8A44]">
                  PayPal Payment Captured & Verified!
                </h4>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                  Transaction recorded in the immutable Security Ledger. Mandate budget has been officially deducted.
                </p>
                {captureDetails?.captureId && (
                  <div className="mt-3 inline-block font-mono text-xs bg-[#F5F8FC] border border-[#DCE5EF] px-3 py-1 rounded text-[#003087]">
                    Capture ID: {captureDetails.captureId}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

