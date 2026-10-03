import { axiosInstance } from './axiosInstance';
import { ApiResponse, PaymentMode, Sale } from '../types';

export interface CreateSalePayload {
  clientGeneratedId: string;
  totalAmount: number;
  paymentMode: PaymentMode;
  items: Array<{
    productId: string;
    quantity: number;
    unitPriceAtSale: number;
    subtotal: number;
  }>;
}

export interface SaleHistoryResponse {
  sales: Sale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ShopStats {
  todayRevenue: number;
  todayBillsCount: number;
  totalProducts: number;
  lowStockCount: number;
}

export const saleApi = {
  createSale: async (payload: CreateSalePayload) => {
    const res = await axiosInstance.post<ApiResponse<Sale>>('/sale', payload);
    return res.data;
  },

  getSales: async (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const res = await axiosInstance.get<ApiResponse<SaleHistoryResponse>>('/sale', { params });
    return res.data;
  },

  getSaleById: async (id: string) => {
    const res = await axiosInstance.get<ApiResponse<Sale>>(`/sale/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await axiosInstance.get<ApiResponse<ShopStats>>('/sale/stats');
    return res.data;
  },

  syncOfflineBatch: async (sales: CreateSalePayload[]) => {
    const res = await axiosInstance.post<ApiResponse<any>>('/sync', { sales });
    return res.data;
  },
};
