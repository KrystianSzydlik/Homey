import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react';

// ============================================================================
// Popover Alignment & Position Types
// ============================================================================

export type PopoverAlign = 'start' | 'center' | 'end';
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

// ============================================================================
// Popover Context
// ============================================================================

export interface PopoverContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentId: string;
}

// ============================================================================
// Popover Root Props
// ============================================================================

export interface PopoverProps {
  /** Controlled open state */
  open?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Popover content (compound components) */
  children: ReactNode;
}

// ============================================================================
// Popover Subcomponent Props
// ============================================================================

export interface PopoverTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom class name */
  className?: string;
  /** Trigger content */
  children: ReactNode;
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Alignment relative to trigger (default: 'center') */
  align?: PopoverAlign;
  /** Which side to prefer (default: 'bottom') */
  side?: PopoverSide;
  /** Offset from trigger in pixels (default: 8) */
  sideOffset?: number;
  /** Match the width of the trigger element (default: false) */
  matchTriggerWidth?: boolean;
  /** Custom class name */
  className?: string;
  /** Content children */
  children: ReactNode;
}

export interface PopoverHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom class name */
  className?: string;
  /** Header content */
  children: ReactNode;
}

export interface PopoverTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Custom class name */
  className?: string;
  /** Title text or content */
  children: ReactNode;
}

export interface PopoverCloseButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom class name */
  className?: string;
  /** Accessible label (default: 'Close') */
  'aria-label'?: string;
}

export interface PopoverBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Custom class name */
  className?: string;
  /** Body content */
  children: ReactNode;
}

// ============================================================================
// Position Types
// ============================================================================

export interface Position {
  top: number;
  left: number;
}

export interface UsePopoverPositionOptions {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  align: PopoverAlign;
  side: PopoverSide;
  sideOffset: number;
}
