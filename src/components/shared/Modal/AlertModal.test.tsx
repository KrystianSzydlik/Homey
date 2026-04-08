import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertModal } from './index';

describe('AlertModal', () => {
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
      render(<AlertModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to proceed?')
      ).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<AlertModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render custom button text', () => {
      render(
        <AlertModal
          {...defaultProps}
          confirmText="Delete"
          cancelText="Go Back"
        />
      );

      expect(
        screen.getByRole('button', { name: 'Delete' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Go Back' })
      ).toBeInTheDocument();
    });

    it('should render default button text', () => {
      render(<AlertModal {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Confirm' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('should apply danger variant by default', () => {
      render(<AlertModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveAttribute('data-variant', 'danger');
    });

    it('should apply warning variant when specified', () => {
      render(<AlertModal {...defaultProps} variant="warning" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveAttribute('data-variant', 'warning');
    });

    it('should apply success variant when specified', () => {
      render(<AlertModal {...defaultProps} variant="success" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveAttribute('data-variant', 'success');
    });
  });

  describe('Loading State', () => {
    it('should disable confirm button when loading', () => {
      render(<AlertModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should disable cancel button when loading', () => {
      render(<AlertModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toBeDisabled();
    });

    it('should show spinner when isLoading is true', () => {
      render(<AlertModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('modal-spinner')).toBeInTheDocument();
    });
  });

  describe('Confirm Button', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertModal {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should not call onConfirm when button is disabled', async () => {
      const user = userEvent.setup();
      render(<AlertModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Handling', () => {
    it('should call onCancel when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<AlertModal {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backdrop Click', () => {
    it('should call onCancel when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<AlertModal {...defaultProps} />);

      const overlay = document.querySelector('[aria-hidden="true"]');
      await user.click(overlay!);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<AlertModal {...defaultProps} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should have proper heading structure', () => {
      render(<AlertModal {...defaultProps} />);

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Confirm Action');
    });

    it('should render both buttons side by side and both enabled', () => {
      render(<AlertModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      expect(cancelButton).toBeEnabled();
      expect(confirmButton).toBeEnabled();
    });

    it('should disable both buttons when loading', () => {
      render(<AlertModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      const confirmButton = screen.getByRole('button', { name: /Confirm/i });

      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Animation', () => {
    it('should animate in when opened', async () => {
      const { rerender } = render(
        <AlertModal {...defaultProps} isOpen={false} />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(<AlertModal {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should animate out when closed', async () => {
      const { rerender } = render(
        <AlertModal {...defaultProps} isOpen={true} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<AlertModal {...defaultProps} isOpen={false} />);

      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });
});
