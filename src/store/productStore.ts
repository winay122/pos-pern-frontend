import { create } from 'zustand';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  selectedCategory: string;
  searchQuery: string;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  findProductByBarcode: (barcode: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedCategory: 'ALL',
  searchQuery: '',

  setProducts: (products) => set({ products }),

  addProduct: (product) =>
    set((state) => ({
      products: [product, ...state.products.filter((p) => p.id !== product.id)],
    })),

  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),

  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  findProductByBarcode: (barcode) => {
    const cleanBarcode = barcode.trim();
    return get().products.find((p) => p.barcodeValue.trim() === cleanBarcode);
  },
}));
