import { create } from 'zustand';
import { Shop } from '../types';

interface AuthState {
  shop: Shop | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (shop: Shop, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  updateShop: (shop: Partial<Shop>) => void;
  logout: () => void;
}

const STORAGE_KEY = 'vira_pos_shop_auth';

const loadInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accessToken && parsed.shop) {
        return {
          shop: parsed.shop,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          isAuthenticated: true,
        };
      }
    }
  } catch (e) {
    console.error('Error loading auth from localStorage', e);
  }
  return {
    shop: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadInitialState(),

  setAuth: (shop, accessToken, refreshToken) => {
    const state = { shop, accessToken, refreshToken, isAuthenticated: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    set(state);
  },

  setTokens: (accessToken, refreshToken) => {
    const current = get();
    const nextRefreshToken = refreshToken || current.refreshToken;
    const nextState = {
      ...current,
      accessToken,
      refreshToken: nextRefreshToken,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    set({ accessToken, refreshToken: nextRefreshToken });
  },

  updateShop: (updatedFields) => {
    const current = get();
    if (!current.shop) return;
    const nextShop = { ...current.shop, ...updatedFields };
    const nextState = { ...current, shop: nextShop };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    set({ shop: nextShop });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      shop: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
