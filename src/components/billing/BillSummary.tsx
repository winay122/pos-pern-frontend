import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { PaymentMode } from '../../types';
import { Button } from '../common/Button';
import { Banknote, QrCode, BookOpen, CheckCircle2 } from 'lucide-react';

interface BillSummaryProps {
  onCompleteSale: () => Promise<void>;
  isLoading?: boolean;
}

export const BillSummary: React.FC<BillSummaryProps> = ({ onCompleteSale, isLoading = false }) => {
  const {
    items,
    paymentMode,
    setPaymentMode,
    tenderedAmount,
    setTenderedAmount,
    getTotal,
    getChangeDue,
  } = useCartStore();

  const totalAmount = getTotal();
  const changeDue = getChangeDue();

  const paymentModes: Array<{ mode: PaymentMode; label: string; icon: React.ReactNode }> = [
    { mode: 'CASH', label: 'Cash / नकद', icon: <Banknote className="w-4 h-4" /> },
    { mode: 'UPI', label: 'UPI / क्यूआर', icon: <QrCode className="w-4 h-4" /> },
    { mode: 'CREDIT', label: 'Khata / उधार', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const quickAmounts = [
    { label: 'Exact', amount: totalAmount },
    { label: '₹50', amount: 50 },
    { label: '₹100', amount: 100 },
    { label: '₹200', amount: 200 },
    { label: '₹500', amount: 500 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Big Total Amount Banner */}
      <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-center">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
          Total Payable / कुल देय
        </span>
        <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mt-1">
          {formatCurrency(totalAmount)}
        </div>
      </div>

      {/* Payment Mode Selector */}
      <div>
        <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
          Payment Mode / भुगतान माध्यम
        </label>
        <div className="grid grid-cols-3 gap-2">
          {paymentModes.map((p) => {
            const isSelected = paymentMode === p.mode;
            return (
              <button
                key={p.mode}
                type="button"
                onClick={() => setPaymentMode(p.mode)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {p.icon}
                <span className="mt-1">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cash Tendered & Change Section (if Cash mode) */}
      {paymentMode === 'CASH' && totalAmount > 0 && (
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Amount Received (ग्राहक से मिला)</span>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={tenderedAmount || ''}
              onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Amount Pills */}
          <div className="flex flex-wrap gap-1.5">
            {quickAmounts.map((qa, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTenderedAmount(qa.amount)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-bold text-slate-300 active:scale-95"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Change to Return */}
          {tenderedAmount >= totalAmount && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-amber-400 font-bold">Change Due / वापस देना है:</span>
              <span className="text-base font-black text-amber-400">{formatCurrency(changeDue)}</span>
            </div>
          )}
        </div>
      )}

      {/* Complete Checkout Button */}
      <Button
        variant="primary"
        size="xl"
        isLoading={isLoading}
        disabled={items.length === 0}
        onClick={onCompleteSale}
        rightIcon={<CheckCircle2 className="w-6 h-6" />}
        className="w-full text-base sm:text-lg font-black py-4 shadow-xl shadow-emerald-950/60"
      >
        Complete Bill / बिल बनाएं
      </Button>
    </div>
  );
};
