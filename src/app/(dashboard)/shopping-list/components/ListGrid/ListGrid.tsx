'use client';

import { useCallback, useTransition, useId } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { ShoppingListWithCreator, ShoppingListWithItems } from '@/types/shopping';
import { useContextMenuState } from '../../hooks/useContextMenuState';
import { useDndSensors } from '../../hooks/useDndSensors';
import { reorderShoppingLists } from '@/app/lib/shopping-list-actions';
import SortableListCard from './SortableListCard';
import ListContextMenu from '../ListContextMenu/ListContextMenu';
import styles from './ListGrid.module.scss';

interface ListGridProps {
  lists: ShoppingListWithCreator[];
  onSelectList: (listId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteList: (listId: string) => void;
  onDeleteAllItems: (listId: string) => void;
  onReorderLists?: (lists: ShoppingListWithItems[]) => void;
}

export default function ListGrid({
  lists,
  onSelectList,
  onOpenCreateModal,
  onDeleteList,
  onDeleteAllItems,
  onReorderLists,
}: ListGridProps) {
  const dndId = useId();
  const { menuState, openMenu, closeMenu } = useContextMenuState();
  const sensors = useDndSensors({ touchDelay: 200 });
  const [, startTransition] = useTransition();

  const selectedList = lists.find((list) => list.id === menuState.targetId);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = lists.findIndex((list) => list.id === active.id);
      const newIndex = lists.findIndex((list) => list.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedLists = arrayMove(lists, oldIndex, newIndex) as ShoppingListWithItems[];

      // Update UI optimistically
      onReorderLists?.(reorderedLists);

      // Persist to server
      const listIds = reorderedLists.map((list) => list.id);
      startTransition(async () => {
        const result = await reorderShoppingLists(listIds);
        if (!result.success) {
          console.error('Failed to reorder lists:', result.error);
        }
      });
    },
    [lists, onReorderLists]
  );

  return (
    <>
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lists.map((list) => list.id)}
          strategy={rectSortingStrategy}
        >
          <div className={styles.grid}>
            {lists.map((list) => (
              <SortableListCard
                key={list.id}
                list={list}
                onSelect={onSelectList}
                onContextMenu={openMenu}
              />
            ))}
            <div className={styles.card} onClick={onOpenCreateModal}>
              <div className={styles.addIcon}>+</div>
              <div className={styles.name}>New List</div>
            </div>
          </div>
        </SortableContext>
      </DndContext>

      {selectedList && (
        <ListContextMenu
          isOpen={menuState.isOpen}
          position={menuState.position}
          listId={selectedList.id}
          listName={selectedList.name}
          itemCount={selectedList._count.items}
          onClearAll={onDeleteAllItems}
          onDelete={onDeleteList}
          onClose={closeMenu}
        />
      )}
    </>
  );
}
