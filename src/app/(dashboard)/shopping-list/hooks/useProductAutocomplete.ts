import { useEffect, useState, useCallback, useRef } from 'react';
import { ProductSuggestion, CatalogSuggestion } from '@/types/shopping';
import { getProductSuggestions } from '@/app/lib/product-actions';

interface UseProductAutocompleteProps {
  searchQuery: string;
  onSelect: (suggestion: ProductSuggestion) => void;
  debounceMs?: number;
  filterProducts?: (query: string, maxResults?: number) => CatalogSuggestion[];
}

export function useProductAutocomplete({
  searchQuery,
  onSelect,
  debounceMs = 300,
  filterProducts,
}: UseProductAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await getProductSuggestions(query);
      setSuggestions(results);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterSuggestionsClientSide = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (!filterProducts) {
        fetchSuggestions(query);
        return;
      }

      setIsLoading(false);
      const results = filterProducts(query, 10);
      setSuggestions(results);
      setIsOpen(true);
      setSelectedIndex(-1);
    },
    [filterProducts, fetchSuggestions]
  );

  useEffect(() => {
    if (filterProducts) {
      const timeoutId = setTimeout(() => {
        filterSuggestionsClientSide(searchQuery);
      }, 50);

      return () => clearTimeout(timeoutId);
    } else {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    }
  }, [
    searchQuery,
    fetchSuggestions,
    filterSuggestionsClientSide,
    debounceMs,
    filterProducts,
  ]);

  const handleSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      onSelect(suggestion);
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        return;
      }

      const hasAddNew =
        searchQuery.trim() &&
        !suggestions.find(
          (s) => s.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );
      const maxIndex = hasAddNew ? suggestions.length : suggestions.length - 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelect(suggestions[selectedIndex]);
          } else if (selectedIndex === -1 && suggestions.length > 0) {
            handleSelect(suggestions[0]);
          } else if (
            (selectedIndex === suggestions.length || selectedIndex === -1) &&
            hasAddNew
          ) {
            handleSelect({
              name: searchQuery.trim(),
              emoji: null,
              category: 'OTHER',
              score: -1,
              source: 'history',
            });
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, selectedIndex, suggestions, searchQuery, handleSelect]
  );

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  return {
    suggestions,
    selectedIndex,
    isOpen,
    isLoading,
    listRef,
    handleKeyDown,
    handleSelect,
    setSelectedIndex,
    openDropdown,
    closeDropdown,
  };
}
