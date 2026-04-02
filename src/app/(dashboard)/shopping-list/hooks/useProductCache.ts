import { useState, useEffect, useCallback } from 'react';
import { CatalogSuggestion } from '@/types/shopping';
import { getAllProducts } from '@/app/lib/product-actions';

const CACHE_KEY = 'homey_product_cache';
const CACHE_TTL = 1000 * 60 * 5;

interface CachedData {
  products: CatalogSuggestion[];
  timestamp: number;
}

export function useProductCache() {
  const [products, setProducts] = useState<CatalogSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);

      const now = Date.now();
      setLastFetched(now);

      try {
        const cacheData: CachedData = { products: data, timestamp: now };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error saving to cache:', error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCache = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  const refreshIfStale = useCallback(() => {
    if (!lastFetched) {
      return fetchProducts();
    }

    const age = Date.now() - lastFetched;
    if (age > 1000 * 60) {
      return fetchProducts();
    }
  }, [lastFetched, fetchProducts]);

  const filterProducts = useCallback(
    (query: string, maxResults: number = 10): CatalogSuggestion[] => {
      if (!query.trim()) return [];

      const searchTerm = query.toLowerCase().trim();

      const scored = products.map((product) => {
        const name = product.name.toLowerCase();
        let score = 0;

        if (name === searchTerm) {
          score = 1000;
        } else if (name.startsWith(searchTerm)) {
          score = 500;
        } else if (name.includes(searchTerm)) {
          score = 100;
        } else {
          return null;
        }

        return { product, score };
      });

      return scored
        .filter(
          (item): item is { product: CatalogSuggestion; score: number } =>
            item !== null
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map((item) => item.product);
    },
    [products]
  );

  useEffect(() => {
    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data: CachedData = JSON.parse(cached);
          const age = Date.now() - data.timestamp;

          if (age < CACHE_TTL) {
            setProducts(data.products);
            setLastFetched(data.timestamp);
            setIsLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.error('Error loading product cache:', error);
      }
      return false;
    };

    const cacheLoaded = loadFromCache();
    if (!cacheLoaded) {
      fetchProducts();
    }
  }, [fetchProducts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && lastFetched) {
        const age = Date.now() - lastFetched;
        if (age > 1000 * 60 * 2) {
          fetchProducts();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastFetched, fetchProducts]);

  return {
    products,
    isLoading,
    lastFetched,
    refreshCache,
    refreshIfStale,
    filterProducts,
  };
}
