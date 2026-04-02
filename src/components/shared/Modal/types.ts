import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'default' | 'danger' | 'warning' | 'success';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  children: ReactNode;
}

export interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  titleId: string;
  descriptionId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export interface ModalOverlayProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: ModalSize;
  className?: string;
  children: ReactNode;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: ReactNode;
}

export interface ModalCloseButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  'aria-label'?: string;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

export interface ModalCancelButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: ReactNode;
}

export interface ModalConfirmButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ModalVariant;
  isLoading?: boolean;
  className?: string;
  children: ReactNode;
}

export interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
}
