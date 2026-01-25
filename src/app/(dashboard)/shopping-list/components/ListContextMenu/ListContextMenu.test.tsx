import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListContextMenu from './ListContextMenu';

describe('ListContextMenu', () => {
  const mockOnClearAll = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    position: { x: 100, y: 200 },
    listId: 'list-1',
    listName: 'Test List',
    itemCount: 5,
    onClearAll: mockOnClearAll,
    onDelete: mockOnDelete,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(<ListContextMenu {...defaultProps} />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ListContextMenu {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should show "Clear All Items" option', () => {
    render(<ListContextMenu {...defaultProps} />);
    expect(screen.getByRole('menuitem', { name: /clear all items/i })).toBeInTheDocument();
  });

  it('should show "Delete List" option', () => {
    render(<ListContextMenu {...defaultProps} />);
    expect(screen.getByRole('menuitem', { name: /delete list/i })).toBeInTheDocument();
  });

  it('should call onClearAll with listId when Clear All Items is clicked', async () => {
    const user = userEvent.setup();
    render(<ListContextMenu {...defaultProps} />);

    await user.click(screen.getByRole('menuitem', { name: /clear all items/i }));

    expect(mockOnClearAll).toHaveBeenCalledWith('list-1');
  });

  it('should call onDelete with listId when Delete List is clicked', async () => {
    const user = userEvent.setup();
    render(<ListContextMenu {...defaultProps} />);

    await user.click(screen.getByRole('menuitem', { name: /delete list/i }));

    expect(mockOnDelete).toHaveBeenCalledWith('list-1');
  });

  it('should call onClose after action', async () => {
    const user = userEvent.setup();
    render(<ListContextMenu {...defaultProps} />);

    await user.click(screen.getByRole('menuitem', { name: /clear all items/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close on Escape key', async () => {
    render(<ListContextMenu {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable Clear All Items when itemCount is 0', () => {
    render(<ListContextMenu {...defaultProps} itemCount={0} />);

    const clearButton = screen.getByRole('menuitem', { name: /clear all items/i });
    expect(clearButton).toBeDisabled();
  });
});
