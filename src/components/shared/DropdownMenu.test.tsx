import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropdownMenu, { DropdownMenuItem } from './DropdownMenu';

describe('DropdownMenu', () => {
  const mockItems: DropdownMenuItem[] = [
    { label: 'Edit', onClick: vi.fn(), variant: 'default' },
    { label: 'Clear All', onClick: vi.fn(), variant: 'warning' },
    { label: 'Delete', onClick: vi.fn(), variant: 'danger' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render trigger button with three dots', () => {
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not render menu initially', () => {
      render(<DropdownMenu items={mockItems} />);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should render disabled trigger when disabled prop is true', () => {
      render(<DropdownMenu items={mockItems} disabled />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      expect(trigger).toBeDisabled();
    });
  });

  describe('Menu Interaction', () => {
    it('should open menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should close menu when trigger is clicked again', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });

      // Open
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Close
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not open menu when disabled', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} disabled />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Menu Item Interaction', () => {
    it('should call onClick when menu item is clicked', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const editItem = screen.getByText('Edit');
      await user.click(editItem);

      expect(mockItems[0].onClick).toHaveBeenCalledTimes(1);
    });

    it('should close menu after item is clicked', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const editItem = screen.getByText('Edit');
      await user.click(editItem);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should not call onClick when disabled item is clicked', async () => {
      const user = userEvent.setup();
      const disabledItems: DropdownMenuItem[] = [
        { label: 'Disabled', onClick: vi.fn(), disabled: true },
        { label: 'Enabled', onClick: vi.fn() },
      ];

      render(<DropdownMenu items={disabledItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const disabledItem = screen.getByText('Disabled');
      await user.click(disabledItem);

      expect(disabledItems[0].onClick).not.toHaveBeenCalled();
    });
  });

  describe('Close Behaviors', () => {
    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <DropdownMenu items={mockItems} />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const outside = screen.getByTestId('outside');
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should close menu when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should focus trigger button after closing with Escape', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });

  describe('Viewport-aware Positioning', () => {
    it('should open menu below trigger when there is enough space', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });

      // Mock trigger near top of viewport
      vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 82,
        left: 100,
        right: 132,
        width: 32,
        height: 32,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      });

      await user.click(trigger);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        // Menu should be positioned below trigger (top = bottom + 8)
        expect(menu.style.top).toBe('90px');
      });
    });

    it('should open menu above trigger when near bottom of viewport', async () => {
      const user = userEvent.setup();

      // Set viewport height
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });

      // Mock trigger near bottom of viewport
      vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 560,
        bottom: 592,
        left: 100,
        right: 132,
        width: 32,
        height: 32,
        x: 100,
        y: 560,
        toJSON: () => ({}),
      });

      await user.click(trigger);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        // With trigger at bottom=592 and viewport height=600, only 0px below.
        // spaceAbove=552 > spaceBelow=0, so menu opens upward.
        // top = triggerTop(560) - gap(8) - menuHeight(defaulted to 200 since jsdom offsetHeight=0 but computePosition uses default 200)
        // = 560 - 8 - 200 = 352
        const menuTop = parseInt(menu.style.top);
        expect(menuTop).toBeLessThan(560);
      });
    });

    it('should clamp menu horizontally when near right edge', async () => {
      const user = userEvent.setup();

      Object.defineProperty(window, 'innerWidth', { value: 400, writable: true });

      render(<DropdownMenu items={mockItems} align="left" />);

      const trigger = screen.getByRole('button', { name: /more actions/i });

      // Mock trigger near right edge
      vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 82,
        left: 360,
        right: 392,
        width: 32,
        height: 32,
        x: 360,
        y: 50,
        toJSON: () => ({}),
      });

      await user.click(trigger);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        // Menu left should be clamped so it doesn't exceed viewport
        const menuLeft = parseInt(menu.style.left);
        expect(menuLeft).toBeLessThanOrEqual(400 - 8); // viewport - padding
      });
    });
  });

  describe('Alignment', () => {
    it('should align menu to the right by default', () => {
      render(<DropdownMenu items={mockItems} />);
      // This would be tested visually or with CSS class checking
      // The component uses align="right" by default
    });

    it('should align menu to the left when specified', () => {
      render(<DropdownMenu items={mockItems} align="left" />);
      // This would be tested visually or with CSS class checking
    });
  });

  describe('Variants', () => {
    it('should render items with different variants', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const editItem = screen.getByText('Edit');
      const clearItem = screen.getByText('Clear All');
      const deleteItem = screen.getByText('Delete');

      expect(editItem).toBeInTheDocument();
      expect(clearItem).toBeInTheDocument();
      expect(deleteItem).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render items with icons when provided', async () => {
      const user = userEvent.setup();
      const itemsWithIcons: DropdownMenuItem[] = [
        { label: 'Edit', onClick: vi.fn(), icon: <span>✏️</span> },
        { label: 'Delete', onClick: vi.fn(), icon: <span>🗑️</span> },
      ];

      render(<DropdownMenu items={itemsWithIcons} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      expect(screen.getByText('✏️')).toBeInTheDocument();
      expect(screen.getByText('🗑️')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when menu opens', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have role="menu" on dropdown', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute('aria-orientation', 'vertical');
      });
    });

    it('should have role="menuitem" on each item', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(3);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      render(<DropdownMenu items={[]} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });
      expect(trigger).toBeInTheDocument();
    });

    it('should handle rapid open/close cycles', async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={mockItems} />);

      const trigger = screen.getByRole('button', { name: /more actions/i });

      // Rapid clicks (even number to end up closed)
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      // Should end up closed after even number of clicks
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should handle clicking on backdrop', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <DropdownMenu items={mockItems} />
        </div>
      );

      const trigger = screen.getByRole('button', { name: /more actions/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click on the document body (outside the menu)
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });
});
