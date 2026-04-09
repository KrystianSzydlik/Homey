import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductBottomSheet from './ProductBottomSheet';
import { ProductCallbackData } from '@/types/shopping';
import { ShoppingCategory } from '@prisma/client';
import { t, Keys } from '@/config/i18n';
import { createMockProduct } from '@/test/factories';

type CreateProductResult = {
  success: boolean;
  product?: ReturnType<typeof createMockProduct>;
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

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
  MockBottomSheet.CancelButton = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="cancel-button" onClick={onClick}>
      {children}
    </button>
  );
  MockBottomSheet.ConfirmButton = ({
    children,
    disabled,
    onClick,
    type,
    form,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    form?: string;
  }) => (
    <button
      data-testid="confirm-button"
      disabled={disabled}
      onClick={onClick}
      type={type}
      form={form}
    >
      {children}
    </button>
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

    it('should allow selecting an emoji and create product with it', async () => {
      const user = userEvent.setup();
      mockCreateProduct.mockResolvedValue({
        success: true,
        product: createMockProduct({ id: 'p1', name: 'Jabłko', emoji: '🍎' })
      });

      render(<ProductBottomSheet {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText('Nazwa produktu');
      await user.type(nameInput, 'Jabłko');

      // Find and click the apple emoji
      const appleEmoji = screen.getByRole('button', { name: /🍎/ });
      await user.click(appleEmoji);

      // JSDOM has issues with external form="id" buttons, trigger form directly
      const form = document.getElementById('product-bottom-sheet-form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockCreateProduct).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Jabłko',
          emoji: '🍎',
        }));
      });
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
    it('should display error message on creation failure', async () => {
      mockCreateProduct.mockRejectedValue(new Error('Failed'));
      render(<ProductBottomSheet {...defaultProps} initialName="Mleko" />);

      const form = document.getElementById('product-bottom-sheet-form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(t(Keys.AUTH.SOMETHING_WENT_WRONG))).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should disable submit button while creating', async () => {
      const deferred = createDeferred<CreateProductResult>();
      mockCreateProduct.mockReturnValue(deferred.promise);
      render(<ProductBottomSheet {...defaultProps} initialName="Mleko" />);

      const submitButton = screen.getByRole('button', { name: /Dodaj/ });
      const form = document.getElementById('product-bottom-sheet-form')!;
      fireEvent.submit(form);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Zapisywanie...');

      deferred.resolve({
        success: true,
        product: createMockProduct({ id: 'product-1', name: 'Mleko' }),
      });

      await waitFor(() => {
        expect(mockOnProductCreated).toHaveBeenCalled();
      });
    });
  });
});
