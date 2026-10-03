import { create } from 'zustand';
import { CartItem, PaymentMode, Product } from '../types';

interface CartState {
  items: CartItem[];
  paymentMode: PaymentMode;
  tenderedAmount: number;
  discountAmount: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setPaymentMode: (mode: PaymentMode) => void;
  setTenderedAmount: (amount: number) => void;
  setDiscountAmount: (discount: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getChangeDue: () => number;
  getTotalItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  paymentMode: 'CASH',
  tenderedAmount: 0,
  discountAmount: 0,

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex((i) => i.product.id === product.id);

      if (existingIndex > -1) {
        const updated = [...state.items];
        const item = updated[existingIndex];
        const newQty = item.quantity + quantity;
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal: Math.round(newQty * item.unitPrice * 100) / 100,
        };
        return { items: updated };
      } else {
        const newItem: CartItem = {
          product,
          quantity,
          unitPrice: product.pricePerUnit,
          subtotal: Math.round(quantity * product.pricePerUnit * 100) / 100,
        };
        return { items: [...state.items, newItem] };
      }
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== productId) };
      }

      return {
        items: state.items.map((item) => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity,
              subtotal: Math.round(quantity * item.unitPrice * 100) / 100,
            };
          }
          return item;
        }),
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
  },

  setPaymentMode: (paymentMode) => set({ paymentMode }),

  setTenderedAmount: (tenderedAmount) => set({ tenderedAmount }),

  setDiscountAmount: (discountAmount) => set({ discountAmount }),

  clearCart: () =>
    set({
      items: [],
      paymentMode: 'CASH',
      tenderedAmount: 0,
      discountAmount: 0,
    }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getTotal: () => {
    const { items, discountAmount } = get();
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    return Math.max(0, subtotal - discountAmount);
  },

  getChangeDue: () => {
    const total = get().getTotal();
    const tendered = get().tenderedAmount;
    return Math.max(0, tendered - total);
  },

  getTotalItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
