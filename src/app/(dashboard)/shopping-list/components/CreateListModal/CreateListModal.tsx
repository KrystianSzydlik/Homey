'use client';

import { Modal } from '@/components/shared/Modal';
import { ShoppingListWithCreator } from '@/types/shopping';
import { CreateListForm } from '../CreateListForm/CreateListForm';
import { createShoppingList } from '@/app/lib/shopping-list-actions';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (list: ShoppingListWithCreator) => void;
}

export default function CreateListModal({
  isOpen,
  onClose,
  onListCreated,
}: CreateListModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content size="md">
        <Modal.Header>
          <Modal.Title>Create Shopping List</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body>
          {/* 
            CreateListModal acts as a "smart container" or "controller" 
            that delegates the actual form UI and logic to CreateListForm.
            
            It passes the server action and the success callback, 
            keeping the modal lightweight and focused on layout.
          */}
          <CreateListForm
            onSubmitAction={createShoppingList}
            onSuccess={(list) => {
              onListCreated(list);
              onClose();
            }}
            onCancel={onClose}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
