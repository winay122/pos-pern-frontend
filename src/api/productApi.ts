import { axiosInstance } from './axiosInstance';
import { ApiResponse, Product, UnitType } from '../types';

export interface CreateProductPayload {
  name: string;
  category?: string;
  unitType: UnitType;
  pricePerUnit: number;
  barcodeValue?: string;
  initialStock?: number;
  lowStockThreshold?: number;
}

export interface UpdateProductPayload {
  name?: string;
  category?: string;
  unitType?: UnitType;
  pricePerUnit?: number;
  barcodeValue?: string;
  lowStockThreshold?: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productApi = {
  getProducts: async (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
    const res = await axiosInstance.get<ApiResponse<ProductListResponse>>('/product', { params });
    return res.data;
  },

  getProductByBarcode: async (barcode: string) => {
    const res = await axiosInstance.get<ApiResponse<Product>>(`/product/barcode/${encodeURIComponent(barcode)}`);
    return res.data;
  },

  getProductById: async (id: string) => {
    const res = await axiosInstance.get<ApiResponse<Product>>(`/product/${id}`);
    return res.data;
  },

  createProduct: async (payload: CreateProductPayload) => {
    const res = await axiosInstance.post<ApiResponse<Product>>('/product', payload);
    return res.data;
  },

  updateProduct: async (id: string, payload: UpdateProductPayload) => {
    const res = await axiosInstance.patch<ApiResponse<Product>>(`/product/${id}`, payload);
    return res.data;
  },

  deleteProduct: async (id: string) => {
    const res = await axiosInstance.delete<ApiResponse<{ id: string }>>(`/product/${id}`);
    return res.data;
  },
};
