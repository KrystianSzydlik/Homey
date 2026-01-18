'use client';

import { useState, useCallback, useTransition } from 'react';
import { updateShoppingItem } from '@/app/lib/shopping-actions';
import {
  ShoppingItemWithCreator,
  ProductSuggestion,
  ProductCallbackData,
  isCatalogSuggestion,
} from '@/types/shopping';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import CreateProductModal from '../CreateProductModal/CreateProductModal';
import ProductAutocomplete from '../ProductAutocomplete/ProductAutocomplete';
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
  isEditing = false,
  onCancel,
}: InlineNameEditProps & { isEditing?: boolean; onCancel?: () => void }) {
  const [, startTransition] = useTransition();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const { refreshCache } = useProductCacheContext();

  const handleProductSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      if (!isCatalogSuggestion(suggestion)) {
        setNewProductName(suggestion.name);
        setShowCreateProduct(true);
        return;
      }

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
          if (onCancel) onCancel();
        }
      });
    },
    [itemId, onUpdate, onCancel]
  );

  const handleCreateNewProduct = useCallback(
    (product: ProductCallbackData) => {
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
          setShowCreateProduct(false);
          refreshCache();
          if (onCancel) onCancel();
        }
      });
    },
    [itemId, onUpdate, refreshCache, onCancel]
  );

  if (!isEditing) {
    return (
      <span
        className={`${styles.nameDisplay} ${isCompleted ? styles.completed : ''}`}
      >
        {initialName}
      </span>
    );
  }

  return (
    <div className={styles.container}>
      <ProductAutocomplete
        onSelect={handleProductSelect}
        initialValue={initialName}
        isCompleted={isCompleted}
        strictMode={true}
        autoFocus={true}
        onBlur={onCancel}
      />

      {showCreateProduct && (
        <CreateProductModal
          isOpen={true}
          initialName={newProductName}
          onProductCreated={handleCreateNewProduct}
          onClose={() => setShowCreateProduct(false)}
        />
      )}
    </div>
  );
}
