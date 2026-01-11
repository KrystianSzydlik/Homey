'use client';

import { createContext, useContext, ReactNode } from 'react';
import { CatalogSuggestion } from '@/types/shopping';
import { useProductCache } from '../hooks/useProductCache';

interface ProductCacheContextValue {
  products: CatalogSuggestion[];
  isLoading: boolean;
  refreshCache: () => Promise<void>;
  filterProducts: (query: string, maxResults?: number) => CatalogSuggestion[];
}

const ProductCacheContext = createContext<ProductCacheContextValue | null>(null);

export function ProductCacheProvider({ children }: { children: ReactNode }) {
  const cache = useProductCache();

  return (
    <ProductCacheContext.Provider value={cache}>
      {children}
    </ProductCacheContext.Provider>
  );
}

export function useProductCacheContext() {
  const context = useContext(ProductCacheContext);
  if (!context) {
    throw new Error('useProductCacheContext must be used within ProductCacheProvider');
  }
  return context;
}
