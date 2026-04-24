import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemBottomSheet from './ItemBottomSheet';
import { ShoppingItemWithCreator } from '@/types/shopping';

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
  MockBottomSheet.CancelButton = ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
    <button data-testid="cancel-button" disabled={disabled}>{children}</button>
  );
  MockBottomSheet.ConfirmButton = ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button data-testid="confirm-button" onClick={onClick} disabled={disabled}>{children}</button>
  );

  return {
    BottomSheet: MockBottomSheet,
  };
});

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
      data-testid="unit-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      <option value="kg">kg</option>
      <option value="l">l</option>
      <option value="szt">szt</option>
    </select>
  ),
}));

// Mock getUnitGroups
vi.mock('@/lib/constants/shopping-units', () => ({
  getUnitGroups: () => [
    {
      label: 'Weight',
      options: [
        { value: 'kg', label: 'kg' },
        { value: 'g', label: 'g' },
      ],
    },
  ],
}));

// Mock updateShoppingItemDetails
const mockUpdateShoppingItemDetails = vi.fn();
vi.mock('@/lib/actions/shopping/update-item', () => ({
  updateShoppingItemDetails: (...args: unknown[]) =>
    mockUpdateShoppingItemDetails(...args),
}));

// Mock parsePlnPrice
vi.mock('@/lib/pln-validation', () => ({
  parsePlnPrice: (input: string) => {
    if (!input) return null;
    const cleaned = input.replace(/zł|PLN/gi, '').replace(/\s/g, '').replace(',', '.').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num) || num < 0) return null;
    return Math.round(num * 100) / 100;
  },
}));

describe('ItemBottomSheet', () => {
  const mockItem: ShoppingItemWithCreator = {
    id: 'item-123',
    name: 'Mleko',
    emoji: '🥛',
    quantity: '1',
    unit: 'l',
    checked: false,
    shoppingListId: 'list-1',
    productId: 'product-1',
    category: 'DAIRY',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { name: 'Test User' },
    householdId: 'household-1',
    createdById: 'user-1',
    position: 0,
    note: null,
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps = {
    item: mockItem,
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render bottom sheet when isOpen is true', () => {
      render(<ItemBottomSheet {...defaultProps} />);
      expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ItemBottomSheet {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
    });

    it('should display product emoji and name in title', () => {
      render(<ItemBottomSheet {...defaultProps} />);
      const title = screen.getByTestId('title');
      expect(title).toHaveTextContent('🥛');
      expect(title).toHaveTextContent('Mleko');
    });

    it('should show quantity input with initial value', () => {
      render(<ItemBottomSheet {...defaultProps} />);
      const quantityInput = screen.getByPlaceholderText('1');
      expect(quantityInput).toHaveValue('1');
    });

    it('should show empty price input by default', () => {
      render(<ItemBottomSheet {...defaultProps} />);
      const priceInput = screen.getByPlaceholderText('0,00');
      expect(priceInput).toHaveValue('');
    });

    it('should show unit-aware price label', () => {
      render(<ItemBottomSheet {...defaultProps} />);
      expect(screen.getByText('Cena za l')).toBeInTheDocument();
    });

    it('should show checked checkbox when item is checked', () => {
      const checkedItem = { ...mockItem, checked: true };
      render(<ItemBottomSheet {...defaultProps} item={checkedItem} />);

      const checkbox = screen.getByRole('checkbox', { name: /Kupione/ });
      expect(checkbox).toBeChecked();
    });

    it('should show helper text for unchecked items', () => {
      render(<ItemBottomSheet {...defaultProps} />);
      expect(
        screen.getByText('Cena robocza — nie liczymy jej w statystykach.')
      ).toBeInTheDocument();
    });

    it('should show helper text for checked items', () => {
      const checkedItem = { ...mockItem, checked: true };
      render(<ItemBottomSheet {...defaultProps} item={checkedItem} />);
      expect(
        screen.getByText('Ta cena trafi do statystyk.')
      ).toBeInTheDocument();
    });
  });

  describe('Form interactions', () => {
    it('should update quantity field', async () => {
      const user = userEvent.setup();
      render(<ItemBottomSheet {...defaultProps} />);

      const quantityInput = screen.getByPlaceholderText('1');
      await user.clear(quantityInput);
      await user.type(quantityInput, '2');

      expect(quantityInput).toHaveValue('2');
    });

    it('should update price field', async () => {
      const user = userEvent.setup();
      render(<ItemBottomSheet {...defaultProps} />);

      const priceInput = screen.getByPlaceholderText('0,00');
      await user.clear(priceInput);
      await user.type(priceInput, '5.99');

      expect(priceInput).toHaveValue('5.99');
    });

    it('should toggle checkbox', async () => {
      const user = userEvent.setup();
      render(<ItemBottomSheet {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', { name: /Kupione/ });
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should change unit dropdown', async () => {
      const user = userEvent.setup();
      render(<ItemBottomSheet {...defaultProps} />);

      const dropdown = screen.getByTestId('unit-dropdown');
      await user.selectOptions(dropdown, 'kg');

      expect(dropdown).toHaveValue('kg');
    });

    it('should allow clearing price by typing', async () => {
      const user = userEvent.setup();
      render(<ItemBottomSheet {...defaultProps} />);

      const priceInput = screen.getByPlaceholderText('0,00');
      await user.clear(priceInput);

      expect(priceInput).toHaveValue('');
    });
  });

  describe('Save functionality', () => {
    it('should call updateShoppingItemDetails on save', async () => {
      const user = userEvent.setup();
      mockUpdateShoppingItemDetails.mockResolvedValue({
        success: true,
        data: {
          quantity: '2',
          unit: 'kg',
          price: 5.99,
          checked: true,
        },
      });

      render(<ItemBottomSheet {...defaultProps} />);

      const quantityInput = screen.getByPlaceholderText('1');
      await user.clear(quantityInput);
      await user.type(quantityInput, '2');

      const saveButton = screen.getByRole('button', { name: 'Zapisz' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateShoppingItemDetails).toHaveBeenCalledWith({
          itemId: 'item-123',
          quantity: '2',
          unit: 'l',
          price: null,
          checked: false,
        });
      });
    });

    it('should call onSave and onClose after successful update', async () => {
      const user = userEvent.setup();
      mockUpdateShoppingItemDetails.mockResolvedValue({
        success: true,
        data: {
          quantity: '2',
          unit: 'l',
          price: 4.5,
          checked: false,
        },
      });

      render(<ItemBottomSheet {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: 'Zapisz' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should accept price input', async () => {
      const user = userEvent.setup();
      render(<ItemBottomSheet {...defaultProps} />);

      const priceInput = screen.getByPlaceholderText('0,00');
      await user.clear(priceInput);
      await user.type(priceInput, '5.50');

      expect(priceInput).toHaveValue('5.50');
    });
  });

  describe('Error handling', () => {
    it('should display error message on save failure', async () => {
      const user = userEvent.setup();
      mockUpdateShoppingItemDetails.mockRejectedValue(new Error('Network error'));

      render(<ItemBottomSheet {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: 'Zapisz' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Nie udało się zapisać. Spróbuj ponownie.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should disable buttons while saving', async () => {
      const user = userEvent.setup();
      mockUpdateShoppingItemDetails.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ItemBottomSheet {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: 'Zapisz' });
      await user.click(saveButton);

      expect(saveButton).toHaveTextContent('Zapisywanie...');
      expect(saveButton).toBeDisabled();

      const cancelButton = screen.getByRole('button', { name: 'Anuluj' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Form reset on open', () => {
    it('should reset form values when reopened', () => {
      const { rerender } = render(
        <ItemBottomSheet {...defaultProps} isOpen={false} />
      );

      const updatedItem = { ...mockItem, quantity: '5' };
      rerender(<ItemBottomSheet {...defaultProps} item={updatedItem} />);

      const quantityInput = screen.getByPlaceholderText('1');
      const priceInput = screen.getByPlaceholderText('0,00');

      expect(quantityInput).toHaveValue('5');
      expect(priceInput).toHaveValue('');
    });
  });
});
