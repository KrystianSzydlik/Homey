import { useState, useCallback } from 'react';

interface ModalState {
  isCreateModalOpen: boolean;
  deleteListId: string | null;
  deleteAllListId: string | null;
}

interface ModalActions {
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDeleteListModal: (listId: string) => void;
  closeDeleteListModal: () => void;
  openDeleteAllModal: (listId: string) => void;
  closeDeleteAllModal: () => void;
}

export type UseShoppingListModalsReturn = ModalState & ModalActions;

export function useShoppingListModals(): UseShoppingListModalsReturn {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [deleteAllListId, setDeleteAllListId] = useState<string | null>(null);

  const openCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

  const openDeleteListModal = useCallback(
    (listId: string) => setDeleteListId(listId),
    []
  );
  const closeDeleteListModal = useCallback(() => setDeleteListId(null), []);

  const openDeleteAllModal = useCallback(
    (listId: string) => setDeleteAllListId(listId),
    []
  );
  const closeDeleteAllModal = useCallback(() => setDeleteAllListId(null), []);

  return {
    isCreateModalOpen,
    deleteListId,
    deleteAllListId,
    openCreateModal,
    closeCreateModal,
    openDeleteListModal,
    closeDeleteListModal,
    openDeleteAllModal,
    closeDeleteAllModal,
  };
}
