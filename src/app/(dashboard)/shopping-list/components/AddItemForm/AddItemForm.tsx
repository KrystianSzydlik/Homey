'use client';

import { useState, useTransition, useCallback } from 'react';
import { createShoppingItem } from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator, ProductSuggestion } from '@/types/shopping';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import ProductAutocomplete from '../ProductAutocomplete/ProductAutocomplete';
import CreateProductModal from '../CreateProductModal/CreateProductModal';
import styles from './AddItemForm.module.scss';

interface AddItemFormProps {
  shoppingListId: string;
  onAddItem: (listId: string, item: any, tempId: string) => void;
}

export default function AddItemForm({
  shoppingListId,
  onAddItem: onAddItemOptimistic,
}: AddItemFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const { refreshCache } = useProductCacheContext();

  const handleCreateNewProduct = useCallback(
    (product: any) => {
      const tempId = `temp-${Date.now()}`;
      const newItem = {
        name: product.name,
        productId: product.id,
        category: product.defaultCategory,
        unit: product.defaultUnit || undefined,
        emoji: product.emoji || undefined,
      };
      onAddItemOptimistic(shoppingListId, newItem, tempId);
      setShowForm(false);
      setShowCreateProduct(false);
      refreshCache();
    },
    [shoppingListId, onAddItemOptimistic, refreshCache]
  );

  const handleProductSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      if (suggestion.source !== 'catalog') {
        setNewProductName(suggestion.name);
        setShowCreateProduct(true);
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const newItem = {
        name: suggestion.name,
        productId: suggestion.id,
        category: suggestion.category,
        unit: suggestion.defaultUnit || undefined,
        emoji: suggestion.emoji || undefined,
      };
      onAddItemOptimistic(shoppingListId, newItem, tempId);
      setShowForm(false);
    },
    [shoppingListId, onAddItemOptimistic]
  );

  return (
    <div className={styles.container}>
      {!showForm ? (
        <button
          className={styles.toggleButton}
          onClick={() => setShowForm(true)}
          type="button"
        >
          Dodaj Produkt
        </button>
      ) : (
        <div className={styles.form}>
          <ProductAutocomplete
            onSelect={handleProductSelect}
            placeholder="Search or type product name..."
            autoFocus
          />

          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              setShowForm(false);
            }}
          >
            Cancel
          </button>

          <CreateProductModal
            isOpen={showCreateProduct}
            onClose={() => setShowCreateProduct(false)}
            initialName={newProductName}
            onProductCreated={handleCreateNewProduct}
          />
        </div>
      )}
    </div>
  );
}
