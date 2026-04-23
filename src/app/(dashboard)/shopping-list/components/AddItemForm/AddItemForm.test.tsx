import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddItemForm from './AddItemForm';
import { ProductSuggestion, ProductCallbackData } from '@/types/shopping';

const mockRefreshCache = vi.fn();
vi.mock('../../contexts/ProductCacheContext', () => ({
  useProductCacheContext: () => ({
    refreshCache: mockRefreshCache,
    filterProducts: vi.fn().mockReturnValue([]),
    refreshIfStale: vi.fn(),
    products: [],
    isLoading: false,
  }),
}));

vi.mock('../ProductAutocomplete/ProductAutocomplete', () => ({
  default: ({
    onSelect,
  }: {
    onSelect: (suggestion: ProductSuggestion) => void;
  }) => (
    <div data-testid="product-autocomplete">
      <button
        data-testid="select-catalog-product"
        onClick={() =>
          onSelect({
            id: 'product-123',
            name: 'Mleko',
            emoji: '🥛',
            category: 'DAIRY',
            defaultUnit: 'l',
            score: 1.0,
            source: 'catalog',
          })
        }
      >
        Select Catalog Product (DAIRY)
      </button>
      <button
        data-testid="select-history-product"
        onClick={() =>
          onSelect({
            name: 'Jabłka',
            emoji: '🍎',
            category: 'FRUITS',
            defaultUnit: 'kg',
            score: 0.8,
            source: 'history',
          })
        }
      >
        Select History Product (FRUITS)
      </button>
      <button
        data-testid="select-vegetables-product"
        onClick={() =>
          onSelect({
            id: 'product-456',
            name: 'Marchewka',
            emoji: '🥕',
            category: 'VEGETABLES',
            defaultUnit: 'kg',
            score: 1.0,
            source: 'catalog',
          })
        }
      >
        Select Vegetables Product
      </button>
    </div>
  ),
}));

vi.mock('../ProductBottomSheet/ProductBottomSheet', () => ({
  default: ({
    isOpen,
    onClose,
    initialName,
    onProductCreated,
  }: {
    isOpen: boolean;
    onClose: () => void;
    initialName: string;
    onProductCreated: (product: ProductCallbackData) => void;
  }) =>
    isOpen ? (
      <div data-testid="create-product-modal">
        <span data-testid="initial-name">{initialName}</span>
        <button
          data-testid="create-product-submit"
          onClick={() =>
            onProductCreated({
              id: 'new-product-789',
              name: initialName,
              emoji: '🍞',
              defaultCategory: 'BAKERY',
              defaultUnit: 'szt',
            })
          }
        >
          Create Product
        </button>
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

describe('AddItemForm', () => {
  const mockOnAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the ProductAutocomplete component', () => {
      render(<AddItemForm onAddItem={mockOnAddItem} />);
      expect(screen.getByTestId('product-autocomplete')).toBeInTheDocument();
    });

    it('should not show ProductBottomSheet initially', () => {
      render(<AddItemForm onAddItem={mockOnAddItem} />);
      expect(
        screen.queryByTestId('create-product-modal')
      ).not.toBeInTheDocument();
    });
  });

  describe('Category Propagation from Catalog Products', () => {
    it('should pass category when selecting a DAIRY product from catalog', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-catalog-product'));

      expect(mockOnAddItem).toHaveBeenCalledWith('Mleko', 'product-123', {
        emoji: '🥛',
        defaultUnit: 'l',
        category: 'DAIRY',
      });
    });

    it('should pass category when selecting a VEGETABLES product from catalog', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-vegetables-product'));

      expect(mockOnAddItem).toHaveBeenCalledWith('Marchewka', 'product-456', {
        emoji: '🥕',
        defaultUnit: 'kg',
        category: 'VEGETABLES',
      });
    });
  });

  describe('History Product Selection (Opens Create Modal)', () => {
    it('should open ProductBottomSheet when selecting a history item', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-history-product'));

      expect(screen.getByTestId('create-product-modal')).toBeInTheDocument();
      expect(screen.getByTestId('initial-name')).toHaveTextContent('Jabłka');
    });

    it('should not call onAddItem when opening the create modal', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-history-product'));

      expect(mockOnAddItem).not.toHaveBeenCalled();
    });
  });

  describe('Category Propagation from New Product Creation', () => {
    it('should pass defaultCategory when creating a new product', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-history-product'));
      expect(screen.getByTestId('create-product-modal')).toBeInTheDocument();

      await user.click(screen.getByTestId('create-product-submit'));

      expect(mockOnAddItem).toHaveBeenCalledWith('Jabłka', 'new-product-789', {
        emoji: '🍞',
        defaultUnit: 'szt',
        category: 'BAKERY',
      });
    });

    it('should close modal after creating product', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-history-product'));
      await user.click(screen.getByTestId('create-product-submit'));

      expect(
        screen.queryByTestId('create-product-modal')
      ).not.toBeInTheDocument();
    });
  });

  describe('Cache Refresh After Product Creation', () => {
    it('should call refreshCache after creating a new product', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-history-product'));

      await user.click(screen.getByTestId('create-product-submit'));

      expect(mockRefreshCache).toHaveBeenCalledTimes(1);
    });

    it('should not call refreshCache when selecting existing catalog product', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-catalog-product'));

      expect(mockRefreshCache).not.toHaveBeenCalled();
    });
  });

  describe('Modal Close Behavior', () => {
    it('should close modal without calling onAddItem or refreshCache', async () => {
      const user = userEvent.setup();
      render(<AddItemForm onAddItem={mockOnAddItem} />);

      await user.click(screen.getByTestId('select-history-product'));
      expect(screen.getByTestId('create-product-modal')).toBeInTheDocument();

      await user.click(screen.getByTestId('close-modal'));

      expect(
        screen.queryByTestId('create-product-modal')
      ).not.toBeInTheDocument();
      expect(mockOnAddItem).not.toHaveBeenCalled();
      expect(mockRefreshCache).not.toHaveBeenCalled();
    });
  });
});
