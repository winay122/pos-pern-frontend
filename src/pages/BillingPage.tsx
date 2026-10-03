import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { saleApi } from '../api/saleApi';
import { offlineQueue } from '../offline/offlineQueue';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { ScannerInput } from '../components/billing/ScannerInput';
import { CameraScannerModal } from '../components/billing/CameraScannerModal';
import { CartTable } from '../components/billing/CartTable';
import { BillSummary } from '../components/billing/BillSummary';
import { ReceiptModal } from '../components/billing/ReceiptModal';
import { ProductCard } from '../components/product/ProductCard';
import { Sale } from '../types';
import { LayoutGrid, AlertCircle, CheckCircle2 } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { items, getTotal, paymentMode, clearCart, addItem } = useCartStore();
  const { products, setProducts, findProductByBarcode } = useProductStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCamScannerOpen, setIsCamScannerOpen] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch online products and sync to local Dexie database
  const { data: productData, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productApi.getProducts({ limit: 500 });
      return res.data.products;
    },
    enabled: isOnline,
  });

  useEffect(() => {
    if (productData) {
      setProducts(productData);
      offlineQueue.cacheProducts(productData);
    } else {
      // Offline fallback: load from Dexie
      offlineQueue.getCachedProducts().then((cached) => {
        if (cached.length > 0) setProducts(cached);
      });
    }
  }, [productData, setProducts]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Barcode Handler (HID barcode gun or camera scan)
  const handleBarcodeScan = (barcode: string) => {
    const product = findProductByBarcode(barcode);
    if (product) {
      addItem(product, 1);
      showToast('success', `Added "${product.name}" to cart`);
    } else {
      showToast('error', `Barcode "${barcode}" not found in catalog`);
    }
  };

  // Enable global HID keyboard barcode scanner listener
  useBarcodeScanner({
    onScan: handleBarcodeScan,
    disabled: isCamScannerOpen || isReceiptOpen,
  });

  // Filter products for touch grid
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcodeValue.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Complete Sale (Online or Offline Dexie)
  const handleCompleteSale = async () => {
    if (items.length === 0) return;

    const totalAmount = getTotal();
    const clientGeneratedId = `SALE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const salePayload = {
      clientGeneratedId,
      totalAmount,
      paymentMode,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPriceAtSale: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };

    const currentSaleRecord: Sale = {
      clientGeneratedId,
      totalAmount,
      paymentMode,
      syncStatus: isOnline ? 'SYNCED' : 'PENDING',
      createdAt: new Date().toISOString(),
      saleItems: items.map((item) => ({
        productId: item.product.id,
        product: {
          name: item.product.name,
          unitType: item.product.unitType,
          barcodeValue: item.product.barcodeValue,
        },
        quantity: item.quantity,
        unitPriceAtSale: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };

    try {
      setIsSubmitting(true);

      if (isOnline) {
        // Online: POST directly to backend
        await saleApi.createSale(salePayload);
        // Also record in Dexie as SYNCED
        await offlineQueue.enqueueSale({
          ...salePayload,
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
            unitPriceAtSale: i.unitPrice,
            subtotal: i.subtotal,
          })),
          syncStatus: 'SYNCED',
        });
      } else {
        // Offline: Write to Dexie queue as PENDING
        await offlineQueue.enqueueSale({
          ...salePayload,
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
            unitPriceAtSale: i.unitPrice,
            subtotal: i.subtotal,
          })),
          syncStatus: 'PENDING',
        });
      }

      setCompletedSale(currentSaleRecord);
      setIsReceiptOpen(true);
      clearCart();
      if (isOnline) refetch();
    } catch (err: any) {
      console.warn('Online sale failed, falling back to offline queue:', err);
      // Failover to offline queue
      await offlineQueue.enqueueSale({
        ...salePayload,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          unitPriceAtSale: i.unitPrice,
          subtotal: i.subtotal,
        })),
        syncStatus: 'PENDING',
      });

      currentSaleRecord.syncStatus = 'PENDING';
      setCompletedSale(currentSaleRecord);
      setIsReceiptOpen(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center space-x-2 text-sm font-bold border transition-all animate-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40'
              : 'bg-rose-950/90 text-rose-400 border-rose-500/40'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Scanner & Search Bar */}
      <ScannerInput
        onScan={handleBarcodeScan}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        onOpenCamScanner={() => setIsCamScannerOpen(true)}
      />

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Columns: Touch-Friendly Item Grid */}
        <div className="lg:col-span-7 space-y-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 flex items-center pr-1 flex-shrink-0">
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat as string}
                onClick={() => setSelectedCategory(cat as string)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Items / सभी' : cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto p-1">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => addItem(p, 1)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm">No products found matching your search.</p>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Cart & Checkout Summary */}
        <div className="lg:col-span-5 space-y-4">
          <CartTable />
          <BillSummary onCompleteSale={handleCompleteSale} isLoading={isSubmitting} />
        </div>
      </div>

      {/* Camera Barcode Scanner Modal */}
      <CameraScannerModal
        isOpen={isCamScannerOpen}
        onClose={() => setIsCamScannerOpen(false)}
        onScanSuccess={handleBarcodeScan}
      />

      {/* Finished Bill Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />
    </div>
  );
};
