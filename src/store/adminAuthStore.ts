import { create } from 'zustand';
import { Admin } from '../types';

interface AdminAuthState {
  admin: Admin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAdminAuth: (admin: Admin, accessToken: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'vira_pos_admin_auth';

const loadInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accessToken && parsed.admin) {
        return {
          admin: parsed.admin,
          accessToken: parsed.accessToken,
          isAuthenticated: true,
        };
      }
    }
  } catch (e) {
    console.error('Error loading admin auth from localStorage', e);
  }
  return {
    admin: null,
    accessToken: null,
    isAuthenticated: false,
  };
};

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  ...loadInitialState(),

  setAdminAuth: (admin, accessToken) => {
    const state = { admin, accessToken, isAuthenticated: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    set(state);
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      admin: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
