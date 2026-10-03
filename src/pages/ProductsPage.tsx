import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { UNIT_LABELS } from '../utils/unitLabels';
import { Button } from '../components/common/Button';
import { ProductFormModal } from '../components/product/ProductFormModal';
import { BarcodePrintModal } from '../components/product/BarcodePrintModal';
import { Loader } from '../components/common/Loader';
import { Plus, Search, Barcode, Edit, Trash2, Package, Camera } from 'lucide-react';
import { CameraScannerModal } from '../components/billing/CameraScannerModal';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products-list', search],
    queryFn: async () => {
      const res = await productApi.getProducts({ search, limit: 100 });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-list'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-list'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-list'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleFormSubmit = async (formData: any) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const products = data?.products || [];

  return (
    <div className="space-y-6">
      {/* Page Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <Package className="w-8 h-8 text-emerald-400" />
            <span>Product Catalog / सामान सूची</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your shop products, pricing, units, and custom barcodes
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          leftIcon={<Plus className="w-5 h-5" />}
          className="shadow-emerald-950/40"
        >
          Add Product / नया सामान जोड़ें
        </Button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center gap-2 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsScannerOpen(true)}
          leftIcon={<Camera className="w-4 h-4 text-emerald-400" />}
          className="h-[42px] px-3 whitespace-nowrap"
          title="Scan barcode with camera"
        >
          Scan
        </Button>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <Loader text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No Products Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Get started by clicking &quot;Add Product&quot; to add items to your shop.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Unit Type</th>
                  <th className="px-6 py-4">Price (₹)</th>
                  <th className="px-6 py-4">Barcode</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100">{product.name}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {UNIT_LABELS[product.unitType]?.label || product.unitType}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-400 text-base">
                      {formatCurrency(product.pricePerUnit)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Barcode className="w-4 h-4 text-slate-500" />
                        <span>{product.barcodeValue}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setPrintingProduct(product)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
                        title="Print Barcode Labels"
                      >
                        <Barcode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Barcode Print Modal */}
      <BarcodePrintModal
        isOpen={!!printingProduct}
        onClose={() => setPrintingProduct(null)}
        product={printingProduct}
      />

      {/* Camera Scanner Modal to search products */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => setSearch(code)}
      />
    </div>
  );
};
