import Dexie, { Table } from 'dexie';
import { Product, PaymentMode, SyncStatus } from '../types';

export interface OfflineSaleRecord {
  id?: number;
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
  syncStatus: SyncStatus;
  createdAt: string;
  syncedAt?: string;
  errorMessage?: string;
}

export interface CachedStockRecord {
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  lastUpdatedAt: string;
}

export class PosDexieDatabase extends Dexie {
  products!: Table<Product, string>;
  stockCache!: Table<CachedStockRecord, string>;
  salesQueue!: Table<OfflineSaleRecord, number>;

  constructor() {
    super('ViraPosOfflineDB');

    this.version(1).stores({
      products: 'id, barcodeValue, name, category, shopId',
      stockCache: 'productId',
      salesQueue: '++id, &clientGeneratedId, syncStatus, createdAt',
    });
  }
}

export const offlineDb = new PosDexieDatabase();
