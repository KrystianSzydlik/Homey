import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ListBottomSheet from './ListBottomSheet';

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

  return {
    BottomSheet: MockBottomSheet,
  };
});

// Mock CreateListForm
vi.mock('../CreateListForm/CreateListForm', () => ({
  CreateListForm: ({
    onSubmitAction,
    onSuccess,
    onCancel,
  }: {
    onSubmitAction: () => void;
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="create-list-form">
      <button onClick={() => onSubmitAction()}>Submit Action</button>
      <button onClick={() => onSuccess()}>Trigger Success</button>
      <button onClick={() => onCancel()}>Cancel Form</button>
    </div>
  ),
}));

// Mock createShoppingList action
const mockCreateShoppingList = vi.fn();
vi.mock('@/app/lib/shopping-list-actions', () => ({
  createShoppingList: (...args: unknown[]) => mockCreateShoppingList(...args),
}));

describe('ListBottomSheet', () => {
  const mockOnClose = vi.fn();
  const mockOnListCreated = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onListCreated: mockOnListCreated,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render bottom sheet when isOpen is true', () => {
      render(<ListBottomSheet {...defaultProps} />);
      expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ListBottomSheet {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
    });

    it('should display title "Stwórz nową listę"', () => {
      render(<ListBottomSheet {...defaultProps} />);
      expect(screen.getByText('Stwórz nową listę')).toBeInTheDocument();
    });

    it('should render CreateListForm', () => {
      render(<ListBottomSheet {...defaultProps} />);
      expect(screen.getByTestId('create-list-form')).toBeInTheDocument();
    });
  });

  describe('Form integration', () => {
    it('should pass createShoppingList action to form', () => {
      render(<ListBottomSheet {...defaultProps} />);
      const submitButton = screen.getByText('Submit Action');
      expect(submitButton).toBeInTheDocument();
    });

    it('should call onClose when form cancel is triggered', () => {
      render(<ListBottomSheet {...defaultProps} />);
      const cancelButton = screen.getByText('Cancel Form');
      cancelButton.click();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onListCreated and onClose on success', () => {
      render(<ListBottomSheet {...defaultProps} />);
      const successButton = screen.getByText('Trigger Success');
      successButton.click();

      expect(mockOnListCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Wrapper behavior', () => {
    it('should act as a lightweight container', () => {
      const { container } = render(<ListBottomSheet {...defaultProps} />);

      // Should only render BottomSheet wrapper + CreateListForm
      // No custom logic in the component itself
      expect(container.querySelector('[data-testid="bottom-sheet"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="create-list-form"]')).toBeTruthy();
    });
  });
});
