import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react';

// ============================================================================
// Modal Size & Variant Types
// ============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'default' | 'danger' | 'warning' | 'success';

// ============================================================================
// Modal Root Props
// ============================================================================

export interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Close modal when clicking overlay (default: true) */
  closeOnOverlayClick?: boolean;
  /** Close modal when pressing Escape (default: true) */
  closeOnEscape?: boolean;
  /** Prevent body scroll when modal is open (default: true) */
  preventScroll?: boolean;
  /** Modal content (compound components) */
  children: ReactNode;
}

// ============================================================================
// Modal Context
// ============================================================================

export interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  titleId: string;
  descriptionId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

// ============================================================================
// Modal Subcomponent Props
// ============================================================================

export interface ModalOverlayProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom class name */
  className?: string;
}

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Modal size (default: 'md') */
  size?: ModalSize;
  /** Custom class name */
  className?: string;
  /** Modal content */
  children: ReactNode;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom class name */
  className?: string;
  /** Header content */
  children: ReactNode;
}

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Custom class name */
  className?: string;
  /** Title text or content */
  children: ReactNode;
}

export interface ModalCloseButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom class name */
  className?: string;
  /** Accessible label (default: 'Close modal') */
  'aria-label'?: string;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom class name */
  className?: string;
  /** Body content */
  children: ReactNode;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom class name */
  className?: string;
  /** Footer content (usually buttons) */
  children: ReactNode;
}

export interface ModalCancelButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom class name */
  className?: string;
  /** Button text */
  children: ReactNode;
}

export interface ModalConfirmButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant (default: 'default') */
  variant?: ModalVariant;
  /** Loading state */
  isLoading?: boolean;
  /** Custom class name */
  className?: string;
  /** Button text */
  children: ReactNode;
}

// ============================================================================
// AlertModal Props (Preset)
// ============================================================================

export interface AlertModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Modal title */
  title: string;
  /** Modal message/description */
  message: string;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Callback when cancelled */
  onCancel: () => void;
  /** Confirm button text (default: 'Confirm') */
  confirmText?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string;
  /** Confirm button variant (default: 'danger') */
  variant?: ModalVariant;
  /** Loading state (disables buttons) */
  isLoading?: boolean;
}
