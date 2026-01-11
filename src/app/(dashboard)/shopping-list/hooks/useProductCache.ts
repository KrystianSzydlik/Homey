import { useState, useEffect, useCallback } from 'react';
import { CatalogSuggestion } from '@/types/shopping';
import { getAllProducts } from '@/app/lib/product-actions';

const CACHE_KEY = 'homey_product_cache';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

interface CachedData {
  products: CatalogSuggestion[];
  timestamp: number;
}

/**
 * Hook for managing client-side product cache with localStorage persistence
 * Provides instant autocomplete by caching all products
 */
export function useProductCache() {
  const [products, setProducts] = useState<CatalogSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data: CachedData = JSON.parse(cached);
          const age = Date.now() - data.timestamp;

          // Use cache if less than TTL old
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

    // If no valid cache, fetch immediately
    if (!cacheLoaded) {
      fetchProducts();
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);

      const now = Date.now();
      setLastFetched(now);

      // Persist to localStorage
      try {
        const cacheData: CachedData = {
          products: data,
          timestamp: now,
        };
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

  /**
   * Refresh cache manually (e.g., after creating a new product)
   */
  const refreshCache = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  /**
   * Filter products by query string (client-side)
   * Returns up to maxResults sorted by relevance
   */
  const filterProducts = useCallback(
    (query: string, maxResults: number = 10): CatalogSuggestion[] => {
      if (!query.trim()) return [];

      const searchTerm = query.toLowerCase().trim();

      // Score each product by relevance
      const scored = products.map((product) => {
        const name = product.name.toLowerCase();
        let score = 0;

        // Exact match
        if (name === searchTerm) {
          score = 1000;
        }
        // Starts with query
        else if (name.startsWith(searchTerm)) {
          score = 500;
        }
        // Contains query
        else if (name.includes(searchTerm)) {
          score = 100;
        }
        // No match
        else {
          return null;
        }

        // Boost by usage (products with higher usageCount appear first)
        // This is already reflected in the order from getAllProducts

        return {
          product,
          score,
        };
      });

      // Filter out non-matches and sort by score
      return scored
        .filter((item): item is { product: CatalogSuggestion; score: number } => item !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map((item) => item.product);
    },
    [products]
  );

  return {
    products,
    isLoading,
    lastFetched,
    refreshCache,
    filterProducts,
  };
}
