import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { Loader } from '../../components/common/Loader';
import { Store, ShoppingCart, Package, IndianRupee, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminApi.getStats();
      return res.data;
    },
  });

  if (isLoading) return <Loader text="Loading platform metrics..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor multi-shop performance, onboarding stats, and total transaction volume
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Shops</span>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Store className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-3">{stats?.totalShops ?? 0}</div>
          <div className="text-xs text-indigo-400 font-semibold mt-1">Active registered stores</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-3">{stats?.totalProducts ?? 0}</div>
          <div className="text-xs text-purple-400 font-semibold mt-1">SKUs across all shops</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 mt-3">{stats?.totalSalesCount ?? 0}</div>
          <div className="text-xs text-cyan-400 font-semibold mt-1">Customer bills generated</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Volume</span>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-3">
            {formatCurrency(stats?.totalSalesVolume ?? 0)}
          </div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">Total platform sales</div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link
          to="/admin/create-shop"
          className="group bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-800/40 hover:border-indigo-500/60 p-6 rounded-3xl shadow-xl flex items-center justify-between transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/50">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                Onboard New Shop
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a new kirana or retail shop on behalf of a store owner
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/shops"
          className="group bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-800/40 hover:border-purple-500/60 p-6 rounded-3xl shadow-xl flex items-center justify-between transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-950/50">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                View All Shops Directory
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect registered stores, phone numbers, and activity
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
