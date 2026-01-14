'use client';

import { useState, useCallback } from 'react';
import { Product, ProductSuggestion } from '@/types/shopping';
import ProductAutocomplete from '../ProductAutocomplete/ProductAutocomplete';
import CreateProductModal from '../CreateProductModal/CreateProductModal';
import styles from './AddItemForm.module.scss';

interface AddItemFormProps {
  onAddItem: (
    name: string,
    productId?: string,
    product?: { emoji?: string | null; defaultUnit?: string | null }
  ) => void;
}

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const handleCreateNewProduct = useCallback(
    (product: any) => {
      // This is called from the modal after a new product is created.
      // Now we can add the shopping item with the new product's ID.
      onAddItem(product.name, product.id, {
        emoji: product.emoji,
        defaultUnit: product.defaultUnit,
      });
      setShowCreateProduct(false);
    },
    [onAddItem]
  );

  const handleProductSelect = useCallback(
    (suggestion: ProductSuggestion) => {
      // If it's a non-catalog item, open the create product modal
      if (suggestion.source !== 'catalog') {
        setNewProductName(suggestion.name);
        setShowCreateProduct(true);
        return;
      }

      // Otherwise, add the item directly
      onAddItem(suggestion.name, suggestion.id, {
        emoji: suggestion.emoji,
        defaultUnit: suggestion.defaultUnit,
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

      <CreateProductModal
        isOpen={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
        initialName={newProductName}
        onProductCreated={handleCreateNewProduct}
      />
    </div>
  );
}
