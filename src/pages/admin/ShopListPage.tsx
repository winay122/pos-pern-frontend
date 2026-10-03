import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/formatCurrency';
import { SHOP_CATEGORY_LABELS } from '../../utils/unitLabels';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Store, Plus, Search, Phone, Calendar, Package, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Shop } from '../../types';

export const ShopListPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-shops-list', search],
    queryFn: async () => {
      const res = await adminApi.getShops({ search, limit: 100 });
      return res.data;
    },
  });

  const shops = data?.shops || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <Store className="w-8 h-8 text-indigo-400" />
            <span>Registered Shops Directory</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of all onboarding shops registered on the platform
          </p>
        </div>

        <Link to="/admin/create-shop">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40"
          >
            Onboard New Shop
          </Button>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center shadow-lg">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by shop name, owner, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Shops Table */}
      {isLoading ? (
        <Loader text="Loading shops directory..." />
      ) : shops.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <Store className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Shops Found</h3>
          <p className="text-slate-400 text-sm mt-1">
            Click &quot;Onboard New Shop&quot; to register your first pilot store.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Shop & Owner</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Bills</th>
                  <th className="px-6 py-4">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shops.map((shop: Shop) => (
                  <tr key={shop.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-100 text-base">{shop.shopName}</div>
                      <div className="text-xs text-slate-400 font-medium">{shop.ownerName}</div>
                      {shop.address && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{shop.address}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span>{shop.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-indigo-300 border border-indigo-900/40 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {SHOP_CATEGORY_LABELS[shop.shopCategory] || shop.shopCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4 text-purple-400" />
                        <span>{shop._count?.products ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      <div className="flex items-center space-x-1">
                        <Receipt className="w-4 h-4 text-emerald-400" />
                        <span>{shop._count?.sales ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{formatDate(shop.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
