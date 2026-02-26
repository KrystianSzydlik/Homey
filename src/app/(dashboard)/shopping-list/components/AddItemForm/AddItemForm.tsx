'use client';

import { useState, useCallback } from 'react';
import { ShoppingCategory } from '@prisma/client';
import { ProductSuggestion, ProductCallbackData } from '@/types/shopping';
import { useProductCacheContext } from '../../contexts/ProductCacheContext';
import ProductAutocomplete from '../ProductAutocomplete/ProductAutocomplete';
import ProductBottomSheet from '../ProductBottomSheet/ProductBottomSheet';
import styles from './AddItemForm.module.scss';

interface AddItemFormProps {
  onAddItem: (
    name: string,
    productId?: string,
    product?: {
      emoji?: string | null;
      defaultUnit?: string | null;
      category?: ShoppingCategory;
    }
  ) => void;
}

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const { refreshCache } = useProductCacheContext();

  const handleCreateNewProduct = useCallback(
    (product: ProductCallbackData) => {
      onAddItem(product.name, product.id, {
        emoji: product.emoji,
        defaultUnit: product.defaultUnit,
        category: product.defaultCategory,
      });
      refreshCache();
      setShowCreateProduct(false);
    },
    [onAddItem, refreshCache]
  );

  const handleProductSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      if (suggestion.source !== 'catalog') {
        setNewProductName(suggestion.name);
        setShowCreateProduct(true);
        return;
      }

      onAddItem(suggestion.name, suggestion.id, {
        emoji: suggestion.emoji,
        defaultUnit: suggestion.defaultUnit,
        category: suggestion.category,
      });
    },
    [onAddItem]
  );

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <ProductAutocomplete
          onSelect={handleProductSelect}
          placeholder="Search or type product name..."
          autoFocus={false}
        />
      </div>

      <ProductBottomSheet
        isOpen={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
        initialName={newProductName}
        onProductCreated={handleCreateNewProduct}
      />
    </div>
  );
}
