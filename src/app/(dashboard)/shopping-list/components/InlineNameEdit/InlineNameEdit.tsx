'use client';

import { useState, useCallback, useTransition } from 'react';
import { updateShoppingItem } from '@/app/lib/shopping-actions';
import {
  ShoppingItemWithCreator,
  ProductSuggestion,
  isCatalogSuggestion,
} from '@/types/shopping';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import ProductAutocomplete from '../ProductAutocomplete/ProductAutocomplete';
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
  const [isPending, startTransition] = useTransition();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const { refreshCache } = useProductCacheContext();

  const handleProductSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      if (initialName === suggestion.name) return;

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
        }
      });
    },
    [itemId, onUpdate, initialName]
  );

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
          setShowCreateProduct(false);
          refreshCache();
        }
      });
    },
    [itemId, onUpdate, refreshCache]
  );

  return (
    <div className={styles.container}>
      <ProductAutocomplete
        initialValue={initialName}
        onSelect={handleProductSelect}
        placeholder="Nazwa produktu"
        strictMode={true}
      />

      {/* Fallback for styling */}
      <input
        type="text"
        value={initialName}
        readOnly
        className={`${styles.input} ${isCompleted ? styles.completed : ''}`}
        style={{ display: 'none' }}
      />

      {isPending && <span className={styles.spinner}></span>}

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
