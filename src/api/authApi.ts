import { axiosInstance } from './axiosInstance';
import { ApiResponse, Shop, ShopCategory } from '../types';

export interface RegisterPayload {
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  password: string;
  shopCategory: ShopCategory;
  address?: string;
}

export interface LoginPayload {
  phoneNumber: string;
  password?: string;
  otp?: string;
}

export interface AuthResponseData {
  shop: Shop;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const res = await axiosInstance.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return res.data;
  },

  sendOtp: async (phoneNumber: string) => {
    const res = await axiosInstance.post<ApiResponse<{ message: string }>>('/auth/send-otp', {
      phoneNumber,
    });
    return res.data;
  },

  login: async (payload: LoginPayload) => {
    const res = await axiosInstance.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  getShopProfile: async () => {
    const res = await axiosInstance.get<ApiResponse<Shop>>('/shop/profile');
    return res.data;
  },

  updateShopProfile: async (payload: Partial<Shop>) => {
    const res = await axiosInstance.patch<ApiResponse<Shop>>('/shop/profile', payload);
    return res.data;
  },
};
