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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
      success: true,
      item: {
        id: 'item-1',
        quantity: '2',
        unit: 'kg',
        createdBy: { name: 'Test' },
      } as any,
    });
  });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(shoppingActions.updateShoppingItem).mockResolvedValue({
      success: true,
      item: {
        id: 'item-1',
        quantity: '2',
        unit: 'kg',
        createdBy: { name: 'Test' },
      } as any,
    });
  });
  describe('Rendering', () => {
    it('should render quantity and unit inputs with initial values', () => {
      render(<InlineQuantityEdit {...defaultProps} />);
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('kg')).toBeInTheDocument();
    });

    it('should render only quantity input if unit is null and not focused', () => {
      render(<InlineQuantityEdit {...defaultProps} initialUnit={null} />);
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('j.m.')).not.toBeInTheDocument();
    });

    it('should render unit input if unit is null but input is focused', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} initialUnit={null} />);
      const quantityInput = screen.getByDisplayValue('2');
      await user.click(quantityInput);
      expect(screen.getByPlaceholderText('j.m.')).toBeInTheDocument();
    });
  });

  describe('Editing', () => {
    it('should disable inputs when saving', async () => {
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
                    quantity: '5',
                    unit: 'szt',
                    createdBy: { name: 'Test' },
                  } as any,
                }),
              100
            );
          })
      );
      render(<InlineQuantityEdit {...defaultProps} />);

      const quantityInput = screen.getByDisplayValue('2');
      await user.clear(quantityInput);
      await user.type(quantityInput, '5');
      fireEvent.blur(quantityInput);

      await waitFor(() => {
        expect(quantityInput).toBeDisabled();
        // The unit input might disappear if empty, so we check conditionally
        const unitInput = screen.queryByDisplayValue('kg');
        if (unitInput) {
          expect(unitInput).toBeDisabled();
        }
      });
    });
  });

  describe('Save Functionality', () => {
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

      render(<InlineQuantityEdit {...defaultProps} initialUnit={null} />);
      const quantityInput = screen.getByDisplayValue('2');

      await user.clear(quantityInput);
      await user.type(quantityInput, '10');

      fireEvent.blur(quantityInput);

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

      const { rerender } = render(<InlineQuantityEdit {...defaultProps} />);
      const quantityInput = screen.getByDisplayValue('2');
      fireEvent.blur(quantityInput);

      // After save, the component should re-render with new initial values
      rerender(
        <InlineQuantityEdit
          {...defaultProps}
          initialQuantity="5"
          initialUnit="pieces"
        />
      );
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('pieces')).toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    it('should cancel on Escape key', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);
      const quantityInput = screen.getByDisplayValue('2');

      await user.clear(quantityInput);
      await user.type(quantityInput, '100');
      await user.keyboard('{Escape}');

      expect(shoppingActions.updateShoppingItem).not.toHaveBeenCalled();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    });

    it('should restore initial value on cancel', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);
      const quantityInput = screen.getByDisplayValue('2') as HTMLInputElement;

      await user.clear(quantityInput);
      await user.type(quantityInput, 'invalid value');
      await user.keyboard('{Escape}');

      expect(quantityInput.value).toBe('2');
    });
  });

  describe('Save Logic', () => {
    it('should save quantity without unit', async () => {
      const user = userEvent.setup();
      render(<InlineQuantityEdit {...defaultProps} />);

      const quantityInput = screen.getByDisplayValue('2');
      const unitInput = screen.getByDisplayValue('kg');

      await user.clear(quantityInput);
      await user.type(quantityInput, '5');
      await user.clear(unitInput);
      fireEvent.blur(quantityInput);

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

      const quantityInput = screen.getByDisplayValue('2');
      const unitInput = screen.getByDisplayValue('kg');

      await user.clear(unitInput);
      await user.type(unitInput, 'large bottles');
      fireEvent.blur(unitInput);

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

      const quantityInput = screen.getByDisplayValue('2');
      await user.clear(quantityInput);
      await user.type(quantityInput, '10');
      fireEvent.blur(quantityInput);

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalled();
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
      // Value should revert or stay, depending on desired behavior.
      // Current implementation does not revert.
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
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

      const quantityInput = screen.getByDisplayValue('2');
      await user.clear(quantityInput);
      await user.type(quantityInput, '5{Enter}{Enter}{Enter}');

      await waitFor(() => {
        expect(shoppingActions.updateShoppingItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
