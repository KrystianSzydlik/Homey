import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to proceed?')
      ).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ConfirmModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('should render custom button text', () => {
      render(
        <ConfirmModal
          {...defaultProps}
          confirmText="Delete"
          cancelText="Go Back"
        />
      );

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    });

    it('should render default button text', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should render backdrop', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('should apply danger variant class by default', () => {
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton.className).toContain('danger');
    });

    it('should apply danger variant class when specified', () => {
      render(<ConfirmModal {...defaultProps} variant="danger" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton.className).toContain('danger');
    });

    it('should apply warning variant class when specified', () => {
      render(<ConfirmModal {...defaultProps} variant="warning" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton.className).toContain('warning');
    });
  });

  describe('Loading State', () => {
    it('should show spinner when isLoading is true', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} isLoading={true} confirmText="Delete" />
      );

      const spinner = container.querySelector('[class*="spinner"]');
      expect(spinner).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: /Delete/i });
      expect(confirmButton).toHaveTextContent('Delete');
    });

    it('should disable both buttons when loading', () => {
      render(
        <ConfirmModal {...defaultProps} isLoading={true} />
      );

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should not show spinner when isLoading is false', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} isLoading={false} />
      );

      const spinner = container.querySelector('[class*="spinner"]');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should enable buttons when not loading', () => {
      render(<ConfirmModal {...defaultProps} isLoading={false} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(confirmButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('Confirm Button', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should not call onConfirm when button is disabled', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when button is disabled', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Backdrop Click', () => {
    it('should call onCancel when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        await user.click(backdrop);
      }

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when backdrop is clicked during loading', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ConfirmModal {...defaultProps} isLoading={true} />
      );

      const backdrop = container.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should not call onCancel when modal content is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const modal = screen.getByRole('alertdialog');
      await user.click(modal);

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<ConfirmModal {...defaultProps} />);

      const modal = screen.getByRole('alertdialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'confirm-title');
      expect(modal).toHaveAttribute('aria-describedby', 'confirm-message');
    });

    it('should have proper heading id', () => {
      render(<ConfirmModal {...defaultProps} />);

      const title = screen.getByText('Confirm Action');
      expect(title).toHaveAttribute('id', 'confirm-title');
    });

    it('should have proper message id', () => {
      render(<ConfirmModal {...defaultProps} />);

      const message = screen.getByText('Are you sure you want to proceed?');
      expect(message).toHaveAttribute('id', 'confirm-message');
    });

    it('should mark backdrop as hidden from screen readers', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should animate in when opened', async () => {
      const { rerender } = render(
        <ConfirmModal {...defaultProps} isOpen={false} />
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

      rerender(<ConfirmModal {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('should animate out when closed', async () => {
      const { rerender } = render(<ConfirmModal {...defaultProps} isOpen={true} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      rerender(<ConfirmModal {...defaultProps} isOpen={false} />);

      await waitFor(
        () => {
          expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<ConfirmModal {...defaultProps} title="" />);

      const title = screen.getByRole('heading');
      expect(title).toBeInTheDocument();
      expect(title).toBeEmptyDOMElement();
    });

    it('should handle empty message', () => {
      render(<ConfirmModal {...defaultProps} message="" />);

      const message = document.getElementById('confirm-message');
      expect(message).toBeInTheDocument();
      expect(message).toBeEmptyDOMElement();
    });

    it('should handle long title text', () => {
      const longTitle = 'A'.repeat(200);
      render(<ConfirmModal {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle long message text', () => {
      const longMessage = 'B'.repeat(500);
      render(<ConfirmModal {...defaultProps} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle rapid open/close cycles', async () => {
      const { rerender } = render(
        <ConfirmModal {...defaultProps} isOpen={true} />
      );

      rerender(<ConfirmModal {...defaultProps} isOpen={false} />);
      rerender(<ConfirmModal {...defaultProps} isOpen={true} />);
      rerender(<ConfirmModal {...defaultProps} isOpen={false} />);
      rerender(<ConfirmModal {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });

    it('should handle multiple rapid clicks on confirm button', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      await user.click(confirmButton);
      await user.click(confirmButton);
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });

    it('should prevent double-click during loading', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });

      await user.click(confirmButton);
      await user.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Button Interactions', () => {
    it('should maintain focus on buttons when interacting', async () => {
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      confirmButton.focus();

      expect(confirmButton).toHaveFocus();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      cancelButton.focus();

      expect(cancelButton).toHaveFocus();
    });

    it('should show different variants correctly', () => {
      const { rerender } = render(
        <ConfirmModal {...defaultProps} variant="danger" />
      );

      let confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton.className).toContain('danger');

      rerender(<ConfirmModal {...defaultProps} variant="warning" />);

      confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton.className).toContain('warning');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle transition from loading to not loading', () => {
      const { rerender } = render(
        <ConfirmModal {...defaultProps} isLoading={true} />
      );

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmButton).toBeDisabled();

      rerender(<ConfirmModal {...defaultProps} isLoading={false} />);

      expect(confirmButton).not.toBeDisabled();
    });

    it('should maintain button callbacks after re-render', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ConfirmModal {...defaultProps} />);

      rerender(
        <ConfirmModal
          {...defaultProps}
          message="Updated message"
        />
      );

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should update text when props change', () => {
      const { rerender } = render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();

      rerender(
        <ConfirmModal {...defaultProps} title="New Title" message="New Message" />
      );

      expect(screen.getByText('New Title')).toBeInTheDocument();
      expect(screen.getByText('New Message')).toBeInTheDocument();
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });
  });
});
