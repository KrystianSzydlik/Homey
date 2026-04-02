import { ReactNode, RefObject } from 'react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  closeOnSwipeDown?: boolean;
  preventScroll?: boolean;
  maxHeight?: string;
  children: ReactNode;
}

export interface BottomSheetContextValue {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  closeOnSwipeDown: boolean;
  maxHeight: string;
  contentRef: RefObject<HTMLDivElement | null>;
}

export interface BottomSheetContentProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export interface BottomSheetBaseProps {
  children: ReactNode;
  className?: string;
}

export interface BottomSheetButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
}
