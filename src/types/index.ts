export type ShopCategory = 'GENERAL_STORE' | 'CLOTH' | 'COSMETICS' | 'OTHER';

export type UnitType =
  | 'PIECE'
  | 'KG'
  | 'GRAM'
  | 'LITER'
  | 'ML'
  | 'DOZEN'
  | 'LOT'
  | 'QUINTAL'
  | 'BAG'
  | 'TEN_PIECE';

export type PaymentMode = 'CASH' | 'UPI' | 'CREDIT' | 'OTHER';

export type SyncStatus = 'SYNCED' | 'PENDING';

export interface Shop {
  id: string;
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  shopCategory: ShopCategory;
  address?: string;
  createdAt?: string;
  _count?: {
    products: number;
    sales: number;
  };
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
}

export interface ProductStock {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  lastUpdatedAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  category?: string;
  unitType: UnitType;
  pricePerUnit: number;
  barcodeValue: string;
  stock?: ProductStock;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleItem {
  id?: string;
  productId: string;
  product?: {
    name: string;
    unitType: UnitType;
    barcodeValue: string;
  };
  quantity: number;
  unitPriceAtSale: number;
  subtotal: number;
}

export interface Sale {
  id?: string;
  shopId?: string;
  totalAmount: number;
  paymentMode: PaymentMode;
  syncStatus: SyncStatus;
  clientGeneratedId: string;
  saleItems: SaleItem[];
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}
