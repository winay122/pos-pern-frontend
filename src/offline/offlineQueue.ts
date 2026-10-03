import { offlineDb, OfflineSaleRecord } from './db';
import { Product, PaymentMode } from '../types';

export const offlineQueue = {
  /**
   * Cache products in local Dexie database for instant offline lookup
   */
  cacheProducts: async (products: Product[]) => {
    await offlineDb.transaction('rw', offlineDb.products, offlineDb.stockCache, async () => {
      await offlineDb.products.clear();
      await offlineDb.products.bulkPut(products);

      // Cache stock items
      const stockEntries = products
        .filter((p) => p.stock)
        .map((p) => ({
          productId: p.id,
          quantity: p.stock!.quantity,
          lowStockThreshold: p.stock!.lowStockThreshold,
          lastUpdatedAt: p.stock!.lastUpdatedAt || new Date().toISOString(),
        }));

      await offlineDb.stockCache.bulkPut(stockEntries);
    });
  },

  /**
   * Get all locally cached products
   */
  getCachedProducts: async (): Promise<Product[]> => {
    return await offlineDb.products.toArray();
  },

  /**
   * Look up cached product by barcode
   */
  findProductByBarcode: async (barcode: string): Promise<Product | undefined> => {
    const clean = barcode.trim();
    return await offlineDb.products.where('barcodeValue').equals(clean).first();
  },

  /**
   * Record a sale locally in Dexie salesQueue immediately
   * Deducts local stock immediately
   */
  enqueueSale: async (sale: {
    clientGeneratedId: string;
    totalAmount: number;
    paymentMode: PaymentMode;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPriceAtSale: number;
      subtotal: number;
    }>;
    syncStatus?: 'PENDING' | 'SYNCED';
  }): Promise<OfflineSaleRecord> => {
    const record: OfflineSaleRecord = {
      clientGeneratedId: sale.clientGeneratedId,
      totalAmount: sale.totalAmount,
      paymentMode: sale.paymentMode,
      items: sale.items,
      syncStatus: sale.syncStatus || 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await offlineDb.transaction('rw', offlineDb.salesQueue, offlineDb.stockCache, async () => {
      // 1. Enqueue sale
      await offlineDb.salesQueue.add(record);

      // 2. Deduct local stock
      for (const item of sale.items) {
        const currentStock = await offlineDb.stockCache.get(item.productId);
        if (currentStock) {
          const newQty = Math.max(0, currentStock.quantity - item.quantity);
          await offlineDb.stockCache.update(item.productId, {
            quantity: newQty,
            lastUpdatedAt: new Date().toISOString(),
          });
        }
      }
    });

    return record;
  },

  /**
   * Get all pending sales that need to be synced
   */
  getPendingSales: async (): Promise<OfflineSaleRecord[]> => {
    return await offlineDb.salesQueue.where('syncStatus').equals('PENDING').toArray();
  },

  /**
   * Mark offline sales as synced
   */
  markSalesSynced: async (clientGeneratedIds: string[]) => {
    await offlineDb.transaction('rw', offlineDb.salesQueue, async () => {
      for (const id of clientGeneratedIds) {
        const record = await offlineDb.salesQueue.where('clientGeneratedId').equals(id).first();
        if (record && record.id) {
          await offlineDb.salesQueue.update(record.id, {
            syncStatus: 'SYNCED',
            syncedAt: new Date().toISOString(),
          });
        }
      }
    });
  },

  /**
   * Get total count of pending offline sales
   */
  getPendingCount: async (): Promise<number> => {
    return await offlineDb.salesQueue.where('syncStatus').equals('PENDING').count();
  },
};
