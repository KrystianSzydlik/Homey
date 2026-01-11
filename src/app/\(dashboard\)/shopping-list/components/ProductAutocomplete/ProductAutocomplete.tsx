'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { getProductSuggestions } from '@/app/lib/product-actions';
import { ProductSuggestion } from '@/types/shopping';
import styles from './ProductAutocomplete.module.scss';

interface ProductAutocompleteProps {
  onSelect: (suggestion: ProductSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function ProductAutocomplete({
  onSelect,
  placeholder = 'Search or add product...',
  disabled = false,
  autoFocus = false,
}: ProductAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      startTransition(async () => {
        const fetchedSuggestions = await getProductSuggestions(query);
        setSuggestions(fetchedSuggestions);
        setIsOpen(true);
        setSelectedIndex(0);
      });
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Handle selection
  const handleSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      onSelect(suggestion);
      setQuery('');
      setSuggestions([]);
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === 'Enter' && query.trim()) {
          e.preventDefault();
          // Create suggestion from raw query (fallback)
          const suggestion: ProductSuggestion = {
            name: query.trim(),
            emoji: undefined,
            category: 'OTHER',
            defaultUnit: undefined,
            score: 0.5,
            source: 'history',
          };
          handleSelect(suggestion);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;

        case 'Enter':
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;

        default:
          break;
      }
    },
    [suggestions, selectedIndex, isOpen, query, handleSelect]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionBadge = (suggestion: ProductSuggestion): string => {
    switch (suggestion.source) {
      case 'catalog':
        return '🏷️';
      case 'history':
        return '📅';
      case 'smart':
        return '🔔';
      default:
        return '';
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled || isPending}
        className={styles.input}
        autoComplete="off"
        autoFocus={autoFocus}
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />

      {isPending && <div className={styles.spinner} />}

      {isOpen && suggestions.length > 0 && (
        <div className={styles.dropdown}>
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${suggestion.source}`}
              className={`${styles.option} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={() => handleSelect(suggestion)}
              type="button"
            >
              <span className={styles.badge}>
                {getSuggestionBadge(suggestion)}
              </span>

              {suggestion.emoji && (
                <span className={styles.emoji}>{suggestion.emoji}</span>
              )}

              <span className={styles.name}>{suggestion.name}</span>

              {suggestion.defaultUnit && (
                <span className={styles.unit}>({suggestion.defaultUnit})</span>
              )}

              <span className={styles.source}>{suggestion.source}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isPending && query.trim() && suggestions.length === 0 && (
        <div className={styles.noResults}>
          No products found. Press Enter to add "{query.trim()}"
        </div>
      )}
    </div>
  );
}
