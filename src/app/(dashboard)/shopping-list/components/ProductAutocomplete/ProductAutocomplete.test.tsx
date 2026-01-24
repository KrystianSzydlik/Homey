import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductAutocomplete from './ProductAutocomplete';
import { ProductSuggestion, CatalogSuggestion } from '@/types/shopping';

// Mock scrollIntoView for jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Create mock data
const mockCatalogProducts: CatalogSuggestion[] = [
  {
    id: 'prod-1',
    name: 'Mleko',
    emoji: '🥛',
    category: 'DAIRY',
    defaultUnit: 'l',
    score: 1.0,
    source: 'catalog',
  },
  {
    id: 'prod-2',
    name: 'Marchewka',
    emoji: '🥕',
    category: 'VEGETABLES',
    defaultUnit: 'kg',
    score: 0.9,
    source: 'catalog',
  },
  {
    id: 'prod-3',
    name: 'Chleb',
    emoji: '🍞',
    category: 'BAKERY',
    defaultUnit: 'szt',
    score: 0.8,
    source: 'catalog',
  },
];

// Real filter function that matches the actual implementation
const filterProductsImpl = (query: string, maxResults = 10) => {
  const lowerQuery = query.toLowerCase();
  return mockCatalogProducts
    .filter((p) => p.name.toLowerCase().includes(lowerQuery))
    .slice(0, maxResults);
};

// Mock the ProductCacheContext
const mockRefreshCache = vi.fn();
const mockFilterProducts = vi.fn(filterProductsImpl);

vi.mock('../../contexts/ProductCacheContext', () => ({
  useProductCacheContext: () => ({
    refreshCache: mockRefreshCache,
    filterProducts: mockFilterProducts,
    refreshIfStale: vi.fn(),
    products: mockCatalogProducts,
    isLoading: false,
  }),
}));

// Mock deleteProduct action
vi.mock('@/app/lib/product-actions', () => ({
  deleteProduct: vi.fn().mockResolvedValue({ success: true }),
  getProductSuggestions: vi.fn().mockResolvedValue([]),
}));

// Mock CreateProductModal
vi.mock('../CreateProductModal/CreateProductModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="create-product-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock ConfirmModal
vi.mock('../ConfirmModal/ConfirmModal', () => ({
  default: ({
    isOpen,
    onCancel,
  }: {
    isOpen: boolean;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

describe('ProductAutocomplete', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the input field', () => {
      render(<ProductAutocomplete onSelect={mockOnSelect} />);
      expect(
        screen.getByRole('combobox', { name: undefined })
      ).toBeInTheDocument();
    });

    it('should show placeholder text', () => {
      render(
        <ProductAutocomplete
          onSelect={mockOnSelect}
          placeholder="Search products..."
        />
      );
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });
  });

  describe('Suggestion Display', () => {
    it('should show suggestions when typing', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Mle');

      await waitFor(() => {
        expect(screen.getByText('Mleko')).toBeInTheDocument();
      });
    });

    it('should show "Add new product" option when query has no exact match', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      // Type something that partially matches but is not an exact match
      await user.type(input, 'Mlek');

      await waitFor(() => {
        // Should show the matching product AND the "add new" option since "Mlek" !== "Mleko"
        expect(screen.getByText('Mleko')).toBeInTheDocument();
        // Use a flexible regex that matches both regular and curly quotes
        expect(
          screen.getByText(/\+ Dodaj nowy produkt:.*Mlek/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Category Propagation on Selection', () => {
    it('should pass all fields including category when selecting DAIRY product', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Mle');

      await waitFor(() => {
        expect(screen.getByText('Mleko')).toBeInTheDocument();
      });

      // Click the suggestion
      fireEvent.click(screen.getByText('Mleko'));

      expect(mockOnSelect).toHaveBeenCalledWith({
        id: 'prod-1',
        name: 'Mleko',
        emoji: '🥛',
        category: 'DAIRY',
        defaultUnit: 'l',
        score: 1.0,
        source: 'catalog',
      });
    });

    it('should pass all fields including category when selecting VEGETABLES product', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'March');

      await waitFor(() => {
        expect(screen.getByText('Marchewka')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Marchewka'));

      expect(mockOnSelect).toHaveBeenCalledWith({
        id: 'prod-2',
        name: 'Marchewka',
        emoji: '🥕',
        category: 'VEGETABLES',
        defaultUnit: 'kg',
        score: 0.9,
        source: 'catalog',
      });
    });

    it('should pass all fields including category when selecting BAKERY product', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Chleb');

      await waitFor(() => {
        expect(screen.getByText('Chleb')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Chleb'));

      expect(mockOnSelect).toHaveBeenCalledWith({
        id: 'prod-3',
        name: 'Chleb',
        emoji: '🍞',
        category: 'BAKERY',
        defaultUnit: 'szt',
        score: 0.8,
        source: 'catalog',
      });
    });
  });

  describe('Add New Product Option', () => {
    it('should pass OTHER category when adding new product', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      // Type something that has no matches at all
      await user.type(input, 'Xyz');

      await waitFor(() => {
        // Use flexible regex (handles both regular and curly quotes)
        expect(
          screen.getByText(/\+ Dodaj nowy produkt:.*Xyz/)
        ).toBeInTheDocument();
      });

      // Click the "Add new" option
      const addNewOption = screen.getByText(
        /\+ Dodaj nowy produkt:.*Xyz/
      );
      fireEvent.click(addNewOption);

      expect(mockOnSelect).toHaveBeenCalledWith({
        name: 'Xyz',
        emoji: null,
        category: 'OTHER',
        score: -1,
        source: 'history',
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should select suggestion with Enter key and pass category', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Mle');

      await waitFor(() => {
        expect(screen.getByText('Mleko')).toBeInTheDocument();
      });

      // Press Enter to select the first suggestion
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mleko',
          category: 'DAIRY',
        })
      );
    });

    it('should navigate with arrow keys and select correct item', async () => {
      const user = userEvent.setup();

      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      // Search for "M" which should return both Mleko and Marchewka
      await user.type(input, 'M');

      await waitFor(() => {
        expect(screen.getByText('Mleko')).toBeInTheDocument();
        expect(screen.getByText('Marchewka')).toBeInTheDocument();
      });

      // Navigate down twice (first goes to index 0, second to index 1)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Marchewka',
          category: 'VEGETABLES',
        })
      );
    });
  });

  describe('Input Clearing', () => {
    it('should clear input after selection', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox') as HTMLInputElement;
      await user.type(input, 'Mle');

      await waitFor(() => {
        expect(screen.getByText('Mleko')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Mleko'));

      expect(input.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-controls', 'suggestions-list');
    });

    it('should update aria-expanded when suggestions are shown', async () => {
      const user = userEvent.setup();
      render(<ProductAutocomplete onSelect={mockOnSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Mle');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });
});
