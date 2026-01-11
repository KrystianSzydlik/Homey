import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InlineQuantityEdit from './InlineQuantityEdit';
import * as shoppingActions from '@/src/app/lib/shopping-actions';

vi.mock('@/src/app/lib/shopping-actions', () => ({
  updateShoppingItem: vi.fn(),
}));

describe('InlineQuantityEdit', () => {
  const mockOnUpdate = vi.fn();
  const defaultProps = {
    itemId: 'item-1',
    initialQuantity: '2',
    initialUnit: 'kg',
    onUpdate: mockOnUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display Mode', () => {
    it('should render display button with quantity and unit', () => {
      render(<InlineQuantityEdit {...defaultProps} />);

      const button = screen.getByRole('button', { name: '2 kg' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('2 kg');
    });

    it('should render quantity without unit if unit is null', () => {
      render(
        <InlineQuantityEdit
          {...defaultProps}
          initialQuantity="5"
          initialUnit={null}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('5');
      expect(button).not.toHaveTextContent('kg');
    });

    it('should enter edit mode when clicked', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });
  });

  describe('Edit Mode', () => {
    it('should render input with initial value', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2 kg');
    });

    it('should allow typing in input', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '3 liters');

      expect(input).toHaveValue('3 liters');
    });

    it('should show placeholder text', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));

      const input = screen.getByPlaceholderText('e.g., 2kg, 3 szt');
      expect(input).toBeInTheDocument();
    });

    it('should disable input when saving', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  success: true,
                  item: {
                    id: 'item-1',
                    quantity: '3',
                    unit: 'liters',
                    createdBy: { name: 'Test' },
                  } as any,
                }),
              100
            );
          })
      );

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '3 liters');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should save on blur', async () => {
      const user = userEvent.setup();
      const mockItem = {
        id: 'item-1',
        quantity: '3',
        unit: 'liters',
        createdBy: { name: 'Test' },
      };

      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: mockItem as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '3 liters');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '3',
            unit: 'liters',
          }
        );
        expect(mockOnUpdate).toHaveBeenCalledWith(mockItem);
      });

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should save on Enter key', async () => {
      const user = userEvent.setup();
      const mockItem = {
        id: 'item-1',
        quantity: '500',
        unit: 'g',
        createdBy: { name: 'Test' },
      };

      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: mockItem as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '500g');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '500',
            unit: 'g',
          }
        );
      });
    });

    it('should call onUpdate with updated item', async () => {
      const user = userEvent.setup();
      const mockItem = {
        id: 'item-1',
        quantity: '10',
        unit: null,
        createdBy: { name: 'Test' },
      };

      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: mockItem as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '10');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(mockItem);
      });
    });

    it('should exit edit mode after successful save', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '5',
          unit: 'pieces',
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '5 pieces');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    it('should cancel on Escape key', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '100 kg');
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(shoppingActions.updateShoppingItem).not.toHaveBeenCalled();

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('2 kg');
    });

    it('should restore initial value on cancel', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, 'invalid value');
      await user.keyboard('{Escape}');

      await user.click(screen.getByRole('button'));
      const newInput = screen.getByRole('textbox') as HTMLInputElement;

      expect(newInput.value).toBe('2 kg');
    });
  });

  describe('parseQuantity Logic', () => {
    it('should parse quantity with space-separated unit', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '2',
          unit: 'kg',
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '2 kg');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '2',
            unit: 'kg',
          }
        );
      });
    });

    it('should parse quantity without space before unit', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '500',
          unit: 'g',
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '500g');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '500',
            unit: 'g',
          }
        );
      });
    });

    it('should handle decimal quantities with comma', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '2.5',
          unit: 'kg',
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '2,5 kg');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '2.5',
            unit: 'kg',
          }
        );
      });
    });

    it('should handle quantity with decimal point', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '1.5',
          unit: 'liters',
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '1.5 liters');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '1.5',
            unit: 'liters',
          }
        );
      });
    });

    it('should parse quantity without unit', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '5',
          unit: null,
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '5');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '5',
            unit: undefined,
          }
        );
      });
    });

    it('should handle empty input as "1"', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '1',
          unit: null,
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '1',
            unit: undefined,
          }
        );
      });
    });

    it('should handle Polish units (sztuki)', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '3',
          unit: 'sztuki',
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '3 sztuki');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '3',
            unit: 'sztuki',
          }
        );
      });
    });

    it('should handle multi-word units', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '2',
          unit: 'large bottles',
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '2 large bottles');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledWith(
          'item-1',
          {
            quantity: '2',
            unit: 'large bottles',
          }
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle update failure gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: false,
        error: 'Update failed',
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '10 kg');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalled();
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should handle rapid Enter key presses', async () => {
      const user = userEvent.setup();
      vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
        success: true,
        item: {
          id: 'item-1',
          quantity: '5',
          unit: null,
          createdBy: { name: 'Test' },
        } as any,
      });

      render(<InlineQuantityEdit {...defaultProps} />);

      await user.click(screen.getByRole('button'));
      const input = screen.getByRole('textbox');

      await user.clear(input);
      await user.type(input, '5{Enter}{Enter}{Enter}');

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
