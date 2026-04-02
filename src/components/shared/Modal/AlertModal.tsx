'use client';

import { Modal } from './Modal';
import type { AlertModalProps } from './types';

export function AlertModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: AlertModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <Modal.Overlay />
      <Modal.Content size="sm">
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Modal.CancelButton disabled={isLoading}>
            {cancelText}
          </Modal.CancelButton>
          <Modal.ConfirmButton
            variant={variant}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Modal.ConfirmButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
