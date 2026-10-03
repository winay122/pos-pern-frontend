import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { UNIT_LABELS } from '../../utils/unitLabels';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

export const CartTable: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800/80 min-h-[300px] text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-slate-300">Bill is Empty / बिल खाली है</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Scan barcodes using scanner gun or tap items below to add to cart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Cart Items ({items.length})
        </span>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All / सब हटाएं</span>
        </button>
      </div>

      {/* Item List */}
      <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[420px] flex-1">
        {items.map((item) => {
          const unitStep = UNIT_LABELS[item.product.unitType]?.step || 1;
          const unitShort = UNIT_LABELS[item.product.unitType]?.short || 'unit';

          return (
            <div key={item.product.id} className="p-3.5 sm:p-4 hover:bg-slate-800/30 flex items-center justify-between gap-3">
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-slate-100 truncate">{item.product.name}</h5>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatCurrency(item.unitPrice)} / {unitShort}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - unitStep))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step={unitStep}
                  min="0.1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product.id, parseFloat(e.target.value) || 0)}
                  className="w-14 bg-transparent text-center font-bold text-sm text-slate-100 focus:outline-none"
                />
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + unitStep)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtotal & Delete */}
              <div className="text-right min-w-[75px]">
                <div className="text-sm font-black text-emerald-400">
                  {formatCurrency(item.subtotal)}
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 mt-0.5 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
