import { axiosInstance } from './axiosInstance';
import { ApiResponse, Admin, Shop, ShopCategory } from '../types';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminAuthResponseData {
  admin: Admin;
  accessToken: string;
}

export interface AdminCreateShopPayload {
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  password?: string;
  shopCategory: ShopCategory;
  address?: string;
}

export interface AdminShopListResponse {
  shops: Shop[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminPlatformStats {
  totalShops: number;
  totalProducts: number;
  totalSalesCount: number;
  totalSalesVolume: number;
}

export const adminApi = {
  login: async (payload: AdminLoginPayload) => {
    const res = await axiosInstance.post<ApiResponse<AdminAuthResponseData>>('/admin/auth/login', payload);
    return res.data;
  },

  createShop: async (payload: AdminCreateShopPayload) => {
    const res = await axiosInstance.post<ApiResponse<Shop>>('/admin/shops', payload);
    return res.data;
  },

  getShops: async (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
    const res = await axiosInstance.get<ApiResponse<AdminShopListResponse>>('/admin/shops', { params });
    return res.data;
  },

  getStats: async () => {
    const res = await axiosInstance.get<ApiResponse<AdminPlatformStats>>('/admin/stats');
    return res.data;
  },
};
