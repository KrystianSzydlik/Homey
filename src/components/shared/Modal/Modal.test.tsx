import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './index';

// Helper to render a basic modal
function renderModal(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <Modal {...defaultProps}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Test Modal</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <p>Modal body content</p>
            <input type="text" placeholder="Test input" />
          </Modal.Body>
          <Modal.Footer>
            <Modal.CancelButton>Cancel</Modal.CancelButton>
            <Modal.ConfirmButton>Confirm</Modal.ConfirmButton>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    ),
    onClose: defaultProps.onClose,
  };
}

describe('Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      renderModal({ isOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal in a portal (document.body)', () => {
      renderModal({ isOpen: true });

      // Modal should be rendered in document.body, not in the test container
      const modal = screen.getByRole('dialog');
      expect(modal.closest('body')).toBe(document.body);
    });

    it('should render overlay', () => {
      const { container } = renderModal({ isOpen: true });

      // Overlay should be present (aria-hidden backdrop)
      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toBeInTheDocument();
    });

    it('should render all subcomponents correctly', () => {
      renderModal({ isOpen: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toHaveTextContent('Test Modal');
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on dialog', () => {
      renderModal({ isOpen: true });

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should link title with aria-labelledby', () => {
      renderModal({ isOpen: true });

      const modal = screen.getByRole('dialog');
      const titleId = modal.getAttribute('aria-labelledby');
      const title = document.getElementById(titleId!);

      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Test Modal');
    });

    it('should have proper heading structure', () => {
      renderModal({ isOpen: true });

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test Modal');
    });

    it('should have accessible close button', () => {
      renderModal({ isOpen: true });

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Keyboard Handling', () => {
    it('should close modal when Escape is pressed', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: true, closeOnEscape: true });

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when Escape is pressed and closeOnEscape is false', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: true, closeOnEscape: false });

      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Trap', () => {
    it('should focus first focusable element when modal opens', async () => {
      renderModal({ isOpen: true });

      await waitFor(() => {
        // Close button should be the first focusable element
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toHaveFocus();
      });
    });

    it('should trap focus within modal (Tab cycles through elements)', async () => {
      const user = userEvent.setup();
      renderModal({ isOpen: true });

      // Wait for initial focus
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
      });

      // Tab through elements
      await user.tab();
      expect(screen.getByPlaceholderText('Test input')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();

      // Tab again should cycle back to first element
      await user.tab();
      expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
    });

    it('should trap focus in reverse (Shift+Tab)', async () => {
      const user = userEvent.setup();
      renderModal({ isOpen: true });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
      });

      // Shift+Tab on first element should go to last
      await user.tab({ shift: true });
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
    });
  });

  describe('Overlay Click', () => {
    it('should close modal when overlay is clicked', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: true, closeOnOverlayClick: true });

      const overlay = document.querySelector('[aria-hidden="true"]');
      await user.click(overlay!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when overlay is clicked and closeOnOverlayClick is false', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: true, closeOnOverlayClick: false });

      const overlay = document.querySelector('[aria-hidden="true"]');
      await user.click(overlay!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close modal when modal content is clicked', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: true });

      const modal = screen.getByRole('dialog');
      await user.click(modal);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const { onClose } = renderModal({ isOpen: true });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Body Scroll Prevention', () => {
    it('should prevent body scroll when modal is open', () => {
      renderModal({ isOpen: true, preventScroll: true });

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Content>
            <Modal.Body>Content</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          <Modal.Content>
            <Modal.Body>Content</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should not prevent scroll when preventScroll is false', () => {
      renderModal({ isOpen: true, preventScroll: false });

      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('Animation', () => {
    it('should animate in when opened', async () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Body>Content</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Body>Content</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should animate out when closed', async () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Body>Content</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Body>Content</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });
});

describe('Modal.Content', () => {
  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
      'should apply %s size class',
      (size) => {
        render(
          <Modal isOpen={true} onClose={vi.fn()}>
            <Modal.Content size={size}>
              <Modal.Body>Content</Modal.Body>
            </Modal.Content>
          </Modal>
        );

        const modal = screen.getByRole('dialog');
        expect(modal.className).toContain(size);
      }
    );

    it('should apply md size by default', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Content>
            <Modal.Body>Content</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal.className).toContain('md');
    });
  });

  it('should accept custom className', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Content className="custom-class">
          <Modal.Body>Content</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('custom-class');
  });
});

describe('Modal.ConfirmButton', () => {
  describe('Variants', () => {
    it.each(['default', 'danger', 'warning', 'success'] as const)(
      'should apply %s variant class',
      (variant) => {
        render(
          <Modal isOpen={true} onClose={vi.fn()}>
            <Modal.Content>
              <Modal.Footer>
                <Modal.ConfirmButton variant={variant}>Confirm</Modal.ConfirmButton>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        );

        const button = screen.getByRole('button', { name: 'Confirm' });
        expect(button.className).toContain(variant);
      }
    );

    it('should apply default variant by default', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Content>
            <Modal.Footer>
              <Modal.ConfirmButton>Confirm</Modal.ConfirmButton>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      );

      const button = screen.getByRole('button', { name: 'Confirm' });
      expect(button.className).toContain('default');
    });
  });

  describe('Loading State', () => {
    it('should be disabled when isLoading is true', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Content>
            <Modal.Footer>
              <Modal.ConfirmButton isLoading>Confirm</Modal.ConfirmButton>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      );

      const button = screen.getByRole('button', { name: /Confirm/i });
      expect(button).toBeDisabled();
    });

    it('should show spinner when isLoading is true', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Content>
            <Modal.Footer>
              <Modal.ConfirmButton isLoading>Confirm</Modal.ConfirmButton>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      );

      expect(screen.getByTestId('modal-spinner')).toBeInTheDocument();
    });
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Content>
          <Modal.Footer>
            <Modal.ConfirmButton onClick={handleClick}>Confirm</Modal.ConfirmButton>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Modal.CancelButton', () => {
  it('should call onClose from context when clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={onClose}>
        <Modal.Content>
          <Modal.Footer>
            <Modal.CancelButton>Cancel</Modal.CancelButton>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call custom onClick handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Content>
          <Modal.Footer>
            <Modal.CancelButton onClick={handleClick}>Cancel</Modal.CancelButton>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Modal Composition', () => {
  it('should work without header', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Body>Just body content</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Just body content')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should work without footer', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Title Only</Modal.Title>
          </Modal.Header>
          <Modal.Body>Body content</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Title Only')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('should work without overlay', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Content>
          <Modal.Body>No overlay modal</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('No overlay modal')).toBeInTheDocument();
  });
});

describe('Nested Modals', () => {
  it('should support nested modals', async () => {
    const user = userEvent.setup();
    const outerClose = vi.fn();
    const innerClose = vi.fn();

    function NestedModalExample() {
      return (
        <>
          <Modal isOpen={true} onClose={outerClose}>
            <Modal.Overlay />
            <Modal.Content>
              <Modal.Header>
                <Modal.Title>Outer Modal</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Outer content</p>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal isOpen={true} onClose={innerClose}>
            <Modal.Overlay />
            <Modal.Content>
              <Modal.Header>
                <Modal.Title>Inner Modal</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Inner content</p>
              </Modal.Body>
            </Modal.Content>
          </Modal>
        </>
      );
    }

    render(<NestedModalExample />);

    // Both modals should be visible
    expect(screen.getByText('Outer Modal')).toBeInTheDocument();
    expect(screen.getByText('Inner Modal')).toBeInTheDocument();

    // Pressing Escape should close the inner modal (last one opened)
    await user.keyboard('{Escape}');

    // Inner modal's onClose should be called
    expect(innerClose).toHaveBeenCalled();
  });
});

describe('Edge Cases', () => {
  it('should handle rapid open/close cycles', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={true} onClose={onClose}>
        <Modal.Content>
          <Modal.Body>Content</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    rerender(
      <Modal isOpen={false} onClose={onClose}>
        <Modal.Content>
          <Modal.Body>Content</Modal.Body>
        </Modal.Content>
      </Modal>
    );
    rerender(
      <Modal isOpen={true} onClose={onClose}>
        <Modal.Content>
          <Modal.Body>Content</Modal.Body>
        </Modal.Content>
      </Modal>
    );
    rerender(
      <Modal isOpen={false} onClose={onClose}>
        <Modal.Content>
          <Modal.Body>Content</Modal.Body>
        </Modal.Content>
      </Modal>
    );
    rerender(
      <Modal isOpen={true} onClose={onClose}>
        <Modal.Content>
          <Modal.Body>Content</Modal.Body>
        </Modal.Content>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should throw error when compound components are used outside Modal', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<Modal.Body>Content</Modal.Body>);
    }).toThrow('Modal compound components must be used within a Modal component');

    consoleSpy.mockRestore();
  });
});
