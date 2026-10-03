import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saleApi } from '../api/saleApi';
import { Sale } from '../types';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { ReceiptModal } from '../components/billing/ReceiptModal';
import { Loader } from '../components/common/Loader';
import { Receipt, TrendingUp, ShoppingBag, Eye, Calendar } from 'lucide-react';

export const SalesHistoryPage: React.FC = () => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch sales history
  const { data: salesData, isLoading: isSalesLoading } = useQuery({
    queryKey: ['sales', startDate, endDate],
    queryFn: async () => {
      const res = await saleApi.getSales({ startDate, endDate, limit: 50 });
      return res.data;
    },
  });

  // Fetch today's summary stats
  const { data: statsData } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      const res = await saleApi.getStats();
      return res.data;
    },
  });

  const sales = salesData?.sales || [];
  const stats = statsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <Receipt className="w-8 h-8 text-emerald-400" />
          <span>Sales & Billing History / बिक्री इतिहास</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review past bills, daily turnover, and reprint customer receipts
        </p>
      </div>

      {/* KPI Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Today&apos;s Revenue / आज की बिक्री</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {formatCurrency(stats.todayRevenue)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Today&apos;s Bills / कुल ग्राहक</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 mt-2">
              {stats.todayBillsCount}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Products</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-100 mt-2">
              {stats.totalProducts}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Low Stock Alerts</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {stats.lowStockCount}
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Filter Date:</span>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        />
        <span className="text-xs text-slate-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        />
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-rose-400 hover:underline font-semibold"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Sales List Table */}
      {isSalesLoading ? (
        <Loader text="Loading sales history..." />
      ) : sales.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Sales Recorded Yet</h3>
          <p className="text-slate-400 text-sm mt-1">
            Completed bills will show up here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Bill #</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Payment Mode</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sales.map((sale: Sale) => (
                  <tr key={sale.id || sale.clientGeneratedId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-200">
                      {sale.clientGeneratedId.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{formatDate(sale.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {sale.saleItems?.length || 0} item(s)
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300">
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-400 text-base">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Reprint</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reprint Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
      />
    </div>
  );
};
