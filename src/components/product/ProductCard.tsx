import React from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { UNIT_LABELS } from '../../utils/unitLabels';
import { Plus, Barcode, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onPrintBarcode?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onEdit,
  onPrintBarcode,
}) => {
  const stockQty = product.stock?.quantity ?? 0;
  const isLowStock = product.stock ? stockQty <= product.stock.lowStockThreshold : false;

  return (
    <div className="group relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-150 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col justify-between select-none">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
            {product.category || 'General'}
          </span>

          {isLowStock && (
            <span className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-3 h-3 mr-0.5" />
              Low Stock
            </span>
          )}
        </div>

        <h4 className="text-base font-bold text-slate-100 mt-2 line-clamp-2 leading-tight">
          {product.name}
        </h4>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1.5 font-mono">
          <Barcode className="w-3.5 h-3.5 text-slate-500" />
          <span>{product.barcodeValue}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="text-lg font-black text-emerald-400 leading-tight">
            {formatCurrency(product.pricePerUnit)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            per {UNIT_LABELS[product.unitType]?.label || product.unitType}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onPrintBarcode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrintBarcode(product);
              }}
              title="Print Barcode"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Barcode className="w-4 h-4" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              title="Edit Product"
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors text-xs font-semibold"
            >
              Edit
            </button>
          )}

          <button
            onClick={() => onSelect(product)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
            title="Add to Bill"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
