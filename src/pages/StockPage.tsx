import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi, StockItem } from '../api/stockApi';
import { formatCurrency } from '../utils/formatCurrency';
import { UNIT_LABELS } from '../utils/unitLabels';
import { Loader } from '../components/common/Loader';
import { Boxes, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

export const StockPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [search, setSearch] = useState('');

  const { data: stockItems, isLoading } = useQuery({
    queryKey: ['stocks', lowStockFilter],
    queryFn: async () => {
      const res = await stockApi.getStocks(lowStockFilter);
      return res.data;
    },
  });

  const adjustMutation = useMutation({
    mutationFn: ({ productId, delta }: { productId: string; delta: number }) =>
      stockApi.adjustStock(productId, { delta }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });

  const handleAdjust = (productId: string, delta: number) => {
    adjustMutation.mutate({ productId, delta });
  };

  const filtered = (stockItems || []).filter((item: StockItem) =>
    !search ||
    item.productName.toLowerCase().includes(search.toLowerCase()) ||
    item.barcodeValue.includes(search)
  );

  const lowStockCount = (stockItems || []).filter((i: StockItem) => i.isLowStock).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <Boxes className="w-8 h-8 text-emerald-400" />
            <span>Stock Inventory / स्टॉक प्रबंधन</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track current stock levels, receive low-stock alerts, and record restocks
          </p>
        </div>

        {/* Low Stock Toggle Button */}
        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            lowStockFilter
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-950/40'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Low Stock Alerts ({lowStockCount})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center shadow-lg">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock by product name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Stock Table */}
      {isLoading ? (
        <Loader text="Loading stock records..." />
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">All Stock Levels Healthy</h3>
          <p className="text-slate-400 text-sm mt-1">No items currently below low stock threshold.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Quick Restock (+ / -)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item: StockItem) => {
                  const unitShort = UNIT_LABELS[item.unitType]?.short || 'unit';
                  return (
                    <tr key={item.productId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-100">{item.productName}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.barcodeValue}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-semibold">
                        {formatCurrency(item.pricePerUnit)}
                      </td>
                      <td className="px-6 py-4 font-black text-base">
                        <span className={item.isLowStock ? 'text-amber-400' : 'text-slate-100'}>
                          {item.quantity} {unitShort}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.isLowStock ? (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            Low (limit: {item.lowStockThreshold})
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => handleAdjust(item.productId, -1)}
                            disabled={item.quantity <= 0}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 disabled:opacity-30"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleAdjust(item.productId, 1)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-xs font-bold text-white"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjust(item.productId, 5)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-xs font-bold text-white"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleAdjust(item.productId, 10)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-xs font-bold text-white"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
