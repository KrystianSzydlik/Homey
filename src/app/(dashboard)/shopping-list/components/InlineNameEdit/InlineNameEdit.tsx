'use client';

import { useState, useCallback, useTransition, useEffect, useRef } from 'react';
import { updateShoppingItem } from '@/app/lib/shopping-actions';
import {
  ShoppingItemWithCreator,
  ProductSuggestion,
  isCatalogSuggestion,
} from '@/types/shopping';
import { useProductAutocomplete } from '../../hooks/useProductAutocomplete';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import CreateProductModal from '../CreateProductModal/CreateProductModal';
import styles from './InlineNameEdit.module.scss';

interface InlineNameEditProps {
  itemId: string;
  initialName: string;
  onUpdate: (item: ShoppingItemWithCreator) => void;
  isCompleted?: boolean;
}

export default function InlineNameEdit({
  itemId,
  initialName,
  onUpdate,
  isCompleted = false,
}: InlineNameEditProps) {
  const [inputValue, setInputValue] = useState(initialName);
  const [isPending, startTransition] = useTransition();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { filterProducts, refreshCache } = useProductCacheContext();

  useEffect(() => {
    setInputValue(initialName);
  }, [initialName]);

  const handleProductSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      // If it's a non-catalog product ("+dodaj produkt" option), open modal
      if (!isCatalogSuggestion(suggestion)) {
        setNewProductName(suggestion.name);
        setShowCreateProduct(true);
        return;
      }

      // Update with catalog product
      startTransition(async () => {
        const result = await updateShoppingItem(itemId, {
          name: suggestion.name,
          productId: suggestion.id,
          category: suggestion.category,
          unit: suggestion.defaultUnit || undefined,
          emoji: suggestion.emoji || undefined,
        });

        if (result.success && result.item) {
          onUpdate(result.item);
          setInputValue(suggestion.name);
          setIsEditing(false);
          inputRef.current?.blur();
        }
      });
    },
    [itemId, onUpdate]
  );

  const {
    suggestions,
    selectedIndex,
    isOpen,
    listRef,
    handleKeyDown: autocompleteKeyDown,
    handleSelect,
    setSelectedIndex,
    openDropdown,
    closeDropdown,
  } = useProductAutocomplete({
    searchQuery: inputValue,
    onSelect: handleProductSelect,
    filterProducts,
  });

  const handleCreateNewProduct = useCallback(
    (product: any) => {
      startTransition(async () => {
        const result = await updateShoppingItem(itemId, {
          name: product.name,
          productId: product.id,
          category: product.defaultCategory,
          unit: product.defaultUnit || undefined,
          emoji: product.emoji || undefined,
        });

        if (result.success && result.item) {
          onUpdate(result.item);
          setInputValue(product.name);
          setShowCreateProduct(false);
          setIsEditing(false);
          inputRef.current?.blur();
          refreshCache();
        }
      });
    },
    [itemId, onUpdate, refreshCache]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isOpen) {
        autocompleteKeyDown(e);
        return;
      }
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        setInputValue(initialName);
        e.currentTarget.blur();
      }
    },
    [isOpen, autocompleteKeyDown, initialName]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (showCreateProduct) return;
      setIsEditing(false);
      closeDropdown();
      if (inputValue !== initialName) {
        setInputValue(initialName);
      }
    }, 200);
  }, [initialName, inputValue, closeDropdown, showCreateProduct]);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    openDropdown();
  }, [openDropdown]);

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
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={isPending}
        className={`${styles.input} ${isCompleted ? styles.completed : ''}`}
        placeholder="Product name"
        autoComplete="off"
        role="combobox"
      />

      {isOpen && isEditing && (inputValue.trim() || suggestions.length > 0) && (
        <ul ref={listRef} className={styles.suggestionsList} role="listbox">
          {suggestions.map((suggestion, index) => {
            const badge = getSourceBadge(suggestion.source);
            return (
              <li
                key={`${suggestion.source}-${suggestion.name}-${index}`}
                className={`${styles.suggestionItem} ${
                  index === selectedIndex ? styles.selected : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.suggestionContent}>
                  <div className={styles.mainInfo}>
                    {suggestion.emoji && (
                      <span className={styles.emoji}>{suggestion.emoji}</span>
                    )}
                    <span className={styles.name}>{suggestion.name}</span>
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.badge}>{badge.icon}</span>
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
          {inputValue.trim() &&
            !suggestions.find(
              (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase()
            ) && (
              <li
                className={`${styles.suggestionItem} ${styles.addNewItem} ${
                  selectedIndex === suggestions.length ? styles.selected : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  handleSelect({
                    name: inputValue.trim(),
                    emoji: null,
                    category: 'OTHER',
                    score: -1,
                    source: 'history',
                  })
                }
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
              >
                <div className={styles.suggestionContent}>
                  <div className={styles.mainInfo}>
                    <span className={styles.emoji}>✨</span>
                    <span className={styles.name}>
                      + Dodaj produkt: "{inputValue}"
                    </span>
                  </div>
                </div>
              </li>
            )}
        </ul>
      )}

      {showCreateProduct && (
        <CreateProductModal
          isOpen={true}
          initialName={newProductName}
          onProductCreated={handleCreateNewProduct}
          onClose={() => {
            setShowCreateProduct(false);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}
