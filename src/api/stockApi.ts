import { axiosInstance } from './axiosInstance';
import { ApiResponse, UnitType } from '../types';

export interface StockItem {
  productId: string;
  productName: string;
  category?: string;
  unitType: UnitType;
  barcodeValue: string;
  pricePerUnit: number;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lastUpdatedAt: string;
}

export const stockApi = {
  getStocks: async (lowStockOnly: boolean = false) => {
    const res = await axiosInstance.get<ApiResponse<StockItem[]>>('/stock', {
      params: { lowStock: lowStockOnly },
    });
    return res.data;
  },

  adjustStock: async (productId: string, data: { quantity?: number; delta?: number; lowStockThreshold?: number }) => {
    const res = await axiosInstance.post<ApiResponse<StockItem>>(`/stock/${productId}/adjust`, data);
    return res.data;
  },
};
