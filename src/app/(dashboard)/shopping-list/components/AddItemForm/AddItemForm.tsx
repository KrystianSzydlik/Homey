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
    product?: { emoji?: string | null }
  ) => void;
}

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const handleCreateNewProduct = useCallback(
    (product: any) => {
      // This is called from the modal after a new product is created.
      // Now we can add the shopping item with the new product's ID.
      onAddItem(product.name, product.id, product);
      setShowCreateProduct(false);
      setShowForm(false);
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
      onAddItem(suggestion.name, suggestion.id, { emoji: suggestion.emoji });
      setShowForm(false);
    },
    [onAddItem]
  );

  const handleCancel = () => {
    setShowForm(false);
    setNewProductName('');
    setShowCreateProduct(false);
  };

  if (!showForm) {
    return (
      <div className={styles.container}>
        <button
          className={styles.toggleButton}
          onClick={() => setShowForm(true)}
          type="button"
        >
          Dodaj Produkt
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <ProductAutocomplete
          onSelect={handleProductSelect}
          placeholder="Search or type product name..."
          autoFocus
        />
        <button
          type="button"
          className={styles.cancelButton}
          onClick={handleCancel}
        >
          Cancel
        </button>
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
