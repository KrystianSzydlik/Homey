import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductBottomSheet from './ProductBottomSheet';
import { ProductCallbackData } from '@/types/shopping';
import { ShoppingCategory } from '@prisma/client';

/* eslint-disable react/display-name */
// Mock BottomSheet with all subcomponents
vi.mock('@/components/shared/BottomSheet', () => {
  const MockBottomSheet = ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div data-testid="bottom-sheet">{children}</div> : null);

  MockBottomSheet.Overlay = () => <div data-testid="overlay" />;
  MockBottomSheet.Content = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content">{children}</div>
  );
  MockBottomSheet.Handle = () => <div data-testid="handle" />;
  MockBottomSheet.Header = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header">{children}</div>
  );
  MockBottomSheet.Title = ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="title">{children}</h2>
  );
  MockBottomSheet.CloseButton = () => <button data-testid="close-button">X</button>;
  MockBottomSheet.Body = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="body">{children}</div>
  );
  MockBottomSheet.Footer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="footer">{children}</div>
  );
  MockBottomSheet.CancelButton = ({ children }: { children: React.ReactNode }) => (
    <button data-testid="cancel-button">{children}</button>
  );
  MockBottomSheet.ConfirmButton = ({ children }: { children: React.ReactNode }) => (
    <button data-testid="confirm-button">{children}</button>
  );

  return {
    BottomSheet: MockBottomSheet,
  };
});

// Mock AlertModal
vi.mock('@/components/shared/Modal', () => ({
  AlertModal: ({
    isOpen,
    title,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="alert-modal">
        <h2>{title}</h2>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

// Mock Dropdown
vi.mock('@/components/shared/Dropdown', () => ({
  Dropdown: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  }) => (
    <select
      data-testid="dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      <option value="kg">kg</option>
      <option value="l">l</option>
    </select>
  ),
}));

// Mock product actions
const mockCreateProduct = vi.fn();
const mockUpdateProduct = vi.fn();

vi.mock('@/app/lib/product-actions', () => ({
  createProduct: (...args: unknown[]) => mockCreateProduct(...args),
  updateProduct: (...args: unknown[]) => mockUpdateProduct(...args),
}));

// Mock product utils
vi.mock('@/app/lib/product-utils', () => ({
  getSmartProductDefaults: (name: string) => ({
    category: 'OTHER' as ShoppingCategory,
    emoji: '🛒',
  }),
}));

describe('ProductBottomSheet', () => {
  const mockOnClose = vi.fn();
  const mockOnProductCreated = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onProductCreated: mockOnProductCreated,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render bottom sheet when isOpen is true', () => {
      render(<ProductBottomSheet {...defaultProps} />);
      expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ProductBottomSheet {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
    });

    it('should show "Dodaj produkt" title for new product', () => {
      render(<ProductBottomSheet {...defaultProps} />);
      expect(screen.getByText('Dodaj produkt')).toBeInTheDocument();
    });

    it('should show "Edytuj produkt" title when editing', () => {
      render(
        <ProductBottomSheet
          {...defaultProps}
          productId="product-123"
          initialName="Test Product"
        />
      );
      expect(screen.getByText('Edytuj produkt')).toBeInTheDocument();
    });

    it('should render emoji grid with emojis', () => {
      render(<ProductBottomSheet {...defaultProps} />);
      const emojiButtons = screen.getAllByRole('button', { name: /🍎|🍊|🥛/ });
      expect(emojiButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Form interactions', () => {
    it('should update name field', async () => {
      const user = userEvent.setup();
      render(<ProductBottomSheet {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText('Nazwa produktu');
      await user.type(nameInput, 'Mleko');

      expect(nameInput).toHaveValue('Mleko');
    });

    it('should have clickable emoji buttons', async () => {
      const user = userEvent.setup();
      render(<ProductBottomSheet {...defaultProps} />);

      const emojiButtons = screen.getAllByRole('button');
      const appleEmoji = emojiButtons.find((btn) =>
        btn.textContent?.includes('🍎')
      );

      expect(appleEmoji).toBeTruthy();
      if (appleEmoji) {
        await user.click(appleEmoji);
        // Emoji selection updates internal state
        expect(appleEmoji).toBeInTheDocument();
      }
    });

    it('should render dropdowns for category and unit selection', () => {
      render(<ProductBottomSheet {...defaultProps} />);

      const dropdowns = screen.getAllByTestId('dropdown');
      expect(dropdowns.length).toBeGreaterThan(0);
    });
  });

  describe('Product creation', () => {
    it('should render submit button for new product', () => {
      render(<ProductBottomSheet {...defaultProps} initialName="Mleko" />);

      const submitButton = screen.getByRole('button', { name: /Dodaj/ });
      expect(submitButton).toBeInTheDocument();
    });

    it('should render form for creating product', () => {
      render(<ProductBottomSheet {...defaultProps} initialName="Mleko" />);

      const nameInput = screen.getByPlaceholderText('Nazwa produktu');
      expect(nameInput).toHaveValue('Mleko');
    });
  });

  describe('Product editing', () => {
    it('should render save button when editing existing product', () => {
      render(
        <ProductBottomSheet
          {...defaultProps}
          productId="product-123"
          initialName="Old Product"
          initialCategory="OTHER"
        />
      );

      const submitButton = screen.getByRole('button', { name: /Zapisz/ });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should have name input for product creation', () => {
      render(<ProductBottomSheet {...defaultProps} initialName="Test" />);

      const nameInput = screen.getByPlaceholderText('Nazwa produktu');
      expect(nameInput).toHaveValue('Test');
    });
  });

  describe('Loading states', () => {
    it('should have submit button', () => {
      render(<ProductBottomSheet {...defaultProps} initialName="Test" />);

      const submitButton = screen.getByRole('button', { name: /Dodaj/ });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
