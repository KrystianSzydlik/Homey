'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ProductSuggestion } from '@/types/shopping';
import { getProductSuggestions } from '@/app/lib/product-actions';
import styles from './ProductAutocomplete.module.scss';

interface ProductAutocompleteProps {
  onSelect: (suggestion: ProductSuggestion) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function ProductAutocomplete({
  onSelect,
  placeholder = 'Search products...',
  autoFocus = false,
}: ProductAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
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
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchSuggestions]);

  const handleSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      onSelect(suggestion);
      setSearchQuery('');
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === 'Enter' && searchQuery.trim()) {
          e.preventDefault();
          const fallbackSuggestion: ProductSuggestion = {
            name: searchQuery.trim(),
            emoji: null,
            category: 'OTHER',
            defaultUnit: null,
            score: 0,
            source: 'history',
          };
          handleSelect(fallbackSuggestion);
        }
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
          } else if (selectedIndex === suggestions.length && hasAddNew) {
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

  const getSourceBadge = (source: ProductSuggestion['source']) => {
    switch (source) {
      case 'catalog':
        return { icon: '🏷️', label: 'Catalog' };
      case 'history':
        return { icon: '📅', label: 'Recent' };
      case 'smart':
        return { icon: '🔔', label: 'Due' };
    }
  };

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={styles.input}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="suggestions-list"
        aria-activedescendant={
          selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
        }
      />

      {isLoading && (
        <div className={styles.loadingIndicator}>
          <span className={styles.spinner} />
        </div>
      )}

      {isOpen && (searchQuery.trim() || suggestions.length > 0) && (
        <ul
          ref={listRef}
          id="suggestions-list"
          className={styles.suggestionsList}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => {
            const badge = getSourceBadge(suggestion.source);
            return (
              <li
                key={`${suggestion.source}-${suggestion.name}-${index}`}
                id={`suggestion-${index}`}
                className={`${styles.suggestionItem} ${
                  index === selectedIndex ? styles.selected : ''
                }`}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className={styles.suggestionContent}>
                  <div className={styles.mainInfo}>
                    {suggestion.emoji && (
                      <span className={styles.emoji}>{suggestion.emoji}</span>
                    )}
                    <span className={styles.name}>{suggestion.name}</span>
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.badge} title={badge.label}>
                      {badge.icon}
                    </span>
                    {suggestion.defaultUnit && (
                      <span className={styles.unit}>
                        {suggestion.defaultUnit}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {/* Add New Product Option */}
          {searchQuery.trim() &&
            !suggestions.find(
              (s) => s.name.toLowerCase() === searchQuery.trim().toLowerCase()
            ) && (
              <li
                id={`suggestion-${suggestions.length}`}
                className={`${styles.suggestionItem} ${styles.addNewItem} ${
                  selectedIndex === suggestions.length ? styles.selected : ''
                }`}
                onClick={() =>
                  handleSelect({
                    name: searchQuery.trim(),
                    emoji: null,
                    category: 'OTHER',
                    score: -1,
                    source: 'history',
                  })
                }
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
                role="option"
                aria-selected={selectedIndex === suggestions.length}
              >
                <div className={styles.suggestionContent}>
                  <div className={styles.mainInfo}>
                    <span className={styles.emoji}>✨</span>
                    <span className={styles.name}>
                      + Dodaj nowy produkt: "{searchQuery}"
                    </span>
                  </div>
                </div>
              </li>
            )}
        </ul>
      )}
    </div>
  );
}
