'use client';

import { AlertModal } from '@/components/shared/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export default function ConfirmModal(props: ConfirmModalProps) {
  return <AlertModal {...props} />;
}
