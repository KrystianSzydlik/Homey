'use client';

import { useState, useTransition, useCallback } from 'react';
import { createShoppingItem } from '@/app/lib/shopping-actions';
import { ShoppingItemWithCreator, ProductSuggestion } from '@/types/shopping';
import ProductAutocomplete from '../ProductAutocomplete/ProductAutocomplete';
import CreateProductModal from '../CreateProductModal/CreateProductModal';
import styles from './AddItemForm.module.scss';

interface AddItemFormProps {
  shoppingListId: string;
  onAddItem: (item: ShoppingItemWithCreator) => void;
}

export default function AddItemForm({
  shoppingListId,
  onAddItem,
}: AddItemFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const handleCreateNewProduct = useCallback(
    (product: any) => {
      setError(null);
      startTransition(async () => {
        const result = await createShoppingItem({
          name: product.name,
          shoppingListId,
          productId: product.id,
          category: product.defaultCategory,
          unit: product.defaultUnit || undefined,
          emoji: product.emoji || undefined,
        });

        if (result.success && result.item) {
          onAddItem(result.item);
          setShowForm(false);
          setShowCreateProduct(false);
        } else {
          setError(result.error || 'Failed to add item');
        }
      });
    },
    [shoppingListId, onAddItem]
  );

  const handleProductSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      setError(null);

      // If it's the "Add New" option (score -1) or a history item that isn't a catalog product
      if (suggestion.source !== 'catalog') {
        setNewProductName(suggestion.name);
        setShowCreateProduct(true);
        return;
      }

      startTransition(async () => {
        const productId = suggestion.id;

        const result = await createShoppingItem({
          name: suggestion.name,
          shoppingListId,
          productId,
          category: suggestion.category,
          unit: suggestion.defaultUnit || undefined,
          emoji: suggestion.emoji || undefined,
        });

        if (result.success && result.item) {
          onAddItem(result.item);
          setShowForm(false);
        } else {
          setError(result.error || 'Failed to add item');
        }
      });
    },
    [shoppingListId, onAddItem]
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

          {error && <div className={styles.error}>{error}</div>}

          {isPending && (
            <div className={styles.loadingOverlay}>
              <span className={styles.spinner} />
            </div>
          )}

          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => {
              setShowForm(false);
              setError(null);
            }}
            disabled={isPending}
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
