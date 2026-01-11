import { useState, useEffect, useCallback, useRef } from 'react';
import { CatalogSuggestion } from '@/types/shopping';
import { getAllProducts } from '@/app/lib/product-actions';

const CACHE_KEY = 'homey_product_cache';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes (shorter for multi-user sync)

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

  // Create fetchProducts first, then use in effects
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
   * Smart refresh - only if cache is stale
   * Use when data changes that might include new products
   */
  const refreshIfStale = useCallback(() => {
    if (!lastFetched) {
      return fetchProducts();
    }

    const age = Date.now() - lastFetched;
    // Refresh if older than 1 minute
    if (age > 1000 * 60) {
      console.log('Cache stale, refreshing products...');
      return fetchProducts();
    }
  }, [lastFetched, fetchProducts]);

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

  // Load from localStorage on mount and fetch if needed
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
  }, [fetchProducts]);

  // Refresh cache when user returns to tab (for multi-user sync)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && lastFetched) {
        const age = Date.now() - lastFetched;

        // If cache is older than 2 minutes, refresh it
        if (age > 1000 * 60 * 2) {
          console.log('Tab became visible, refreshing product cache...');
          fetchProducts();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
