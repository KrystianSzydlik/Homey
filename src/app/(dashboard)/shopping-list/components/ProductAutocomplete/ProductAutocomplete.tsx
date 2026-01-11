'use client';

import { useRef, useState, useCallback } from 'react';
import { ProductSuggestion } from '@/types/shopping';
import { useProductAutocomplete } from '../../hooks/useProductAutocomplete';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const { filterProducts } = useProductCacheContext();

  const handleSelectWithClear = useCallback(
    (suggestion: ProductSuggestion) => {
      onSelect(suggestion);
      setSearchQuery('');
      inputRef.current?.blur();
    },
    [onSelect]
  );

  const {
    suggestions,
    selectedIndex,
    isOpen,
    isLoading,
    listRef,
    handleKeyDown,
    handleSelect,
    setSelectedIndex,
    openDropdown,
  } = useProductAutocomplete({
    searchQuery,
    onSelect: handleSelectWithClear,
    filterProducts, // Use client-side filtering for instant results
  });

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
        onFocus={openDropdown}
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
