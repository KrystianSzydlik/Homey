'use client';

import { useRef, useState, useCallback, useTransition } from 'react';
import { ProductSuggestion, isCatalogSuggestion } from '@/types/shopping';
import { useProductAutocomplete } from '../../hooks/useProductAutocomplete';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import { deleteProduct } from '@/app/lib/product-actions';
import DropdownMenu, {
  DropdownMenuItem,
} from '@/components/shared/DropdownMenu';
import CreateProductModal from '../CreateProductModal/CreateProductModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import styles from './ProductAutocomplete.module.scss';

interface ProductAutocompleteProps {
  onSelect: (suggestion: ProductSuggestion) => void;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
  isCompleted?: boolean;
  strictMode?: boolean;
  onBlur?: () => void;
}

export default function ProductAutocomplete({
  onSelect,
  placeholder = 'Search products...',
  autoFocus = false,
  initialValue = '',
  onBlur,
}: ProductAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [editingProduct, setEditingProduct] =
    useState<ProductSuggestion | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] =
    useState<ProductSuggestion | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const { filterProducts, refreshCache } = useProductCacheContext();

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

  const handleEdit = (suggestion: ProductSuggestion) => {
    setEditingProduct(suggestion);
  };

  const handleDeleteClick = (suggestion: ProductSuggestion) => {
    setDeleteConfirmProduct(suggestion);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmProduct || !isCatalogSuggestion(deleteConfirmProduct))
      return;

    startTransition(async () => {
      const result = await deleteProduct(deleteConfirmProduct.id);
      if (result.success) {
        setDeleteConfirmProduct(null);
        refreshCache();
      }
    });
  };

  const getDropdownItems = (
    suggestion: ProductSuggestion
  ): DropdownMenuItem[] => [
    {
      label: 'Edytuj produkt',
      onClick: () => handleEdit(suggestion),
      icon: <span>✏️</span>,
    },
    {
      label: 'Usuń z bazy',
      onClick: () => handleDeleteClick(suggestion),
      variant: 'danger',
      icon: <span>🗑️</span>,
    },
  ];

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={openDropdown}
        onBlur={onBlur}
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
                onMouseDown={(e) => e.preventDefault()}
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
                    {isCatalogSuggestion(suggestion) && (
                      <div
                        className={styles.dropdownWrapper}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <DropdownMenu items={getDropdownItems(suggestion)} />
                      </div>
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
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
                role="option"
                aria-selected={selectedIndex === suggestions.length}
              >
                <div className={styles.suggestionContent}>
                  <div className={styles.mainInfo}>
                    <span className={styles.emoji}>✨</span>
                    <span className={styles.name}>
                      + Dodaj nowy produkt: &ldquo;{searchQuery}&rdquo;
                    </span>
                  </div>
                </div>
              </li>
            )}
        </ul>
      )}

      {editingProduct && isCatalogSuggestion(editingProduct) && (
        <CreateProductModal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          productId={editingProduct.id}
          initialName={editingProduct.name}
          initialCategory={editingProduct.category}
          initialEmoji={editingProduct.emoji || undefined}
          initialUnit={editingProduct.defaultUnit || undefined}
          onProductCreated={() => {
            refreshCache();
            setEditingProduct(null);
          }}
        />
      )}

      {deleteConfirmProduct && isCatalogSuggestion(deleteConfirmProduct) && (
        <ConfirmModal
          isOpen={true}
          title="Usuń produkt z bazy"
          message={`Czy na pewno chcesz usunąć "${deleteConfirmProduct.name}" z katalogu produktów? Ta operacja jest nieodwracalna.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmProduct(null)}
          isLoading={isPending}
          confirmText="Usuń"
          variant="danger"
        />
      )}
    </div>
  );
}
