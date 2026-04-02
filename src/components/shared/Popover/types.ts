import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react';

export type PopoverAlign = 'start' | 'center' | 'end';
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentId: string;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface PopoverTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: ReactNode;
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: PopoverAlign;
  side?: PopoverSide;
  sideOffset?: number;
  matchTriggerWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export interface PopoverHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

export interface PopoverTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: ReactNode;
}

export interface PopoverCloseButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  'aria-label'?: string;
}

export interface PopoverBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

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
