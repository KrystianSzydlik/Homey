'use client';

import { BottomSheet } from '@/components/shared/BottomSheet';
import { ShoppingListWithCreator } from '@/types/shopping';
import { CreateListForm } from '../CreateListForm/CreateListForm';
import { createShoppingList } from '@/app/lib/shopping-list-actions';

interface ListBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (list: ShoppingListWithCreator) => void;
}

export default function ListBottomSheet({
  isOpen,
  onClose,
  onListCreated,
}: ListBottomSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} closeOnSwipeDown>
      <BottomSheet.Overlay />
      <BottomSheet.Content size="md">
        <BottomSheet.Handle />

        <BottomSheet.Header>
          <BottomSheet.Title>Stwórz nową listę</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        <BottomSheet.Body>
          {/*
            ListBottomSheet acts as a "smart container" or "controller"
            that delegates the actual form UI and logic to CreateListForm.

            It passes the server action and the success callback,
            keeping the bottom sheet lightweight and focused on layout.
          */}
          <CreateListForm
            onSubmitAction={createShoppingList}
            onSuccess={(list) => {
              onListCreated(list);
              onClose();
            }}
            onCancel={onClose}
          />
        </BottomSheet.Body>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
