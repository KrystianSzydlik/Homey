'use client';

import { useMemo, useCallback, useTransition } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  ShoppingListWithCreator,
  ShoppingListWithItems,
} from '@/types/shopping';
import { useContextMenuState } from '../../hooks/useContextMenuState';
import { useDndSensors } from '../../hooks/useDndSensors';
import { reorderShoppingLists } from '@/app/lib/shopping-list-actions';
import SortableListChip from './SortableListChip';
import ListContextMenu from '../ListContextMenu/ListContextMenu';
import styles from './ListSelector.module.scss';

interface ListSelectorProps {
  lists: ShoppingListWithCreator[];
  selectedListIds: string[];
  onSelectList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  onDeleteAllItems: (listId: string) => void;
  onReorderLists?: (lists: ShoppingListWithItems[]) => void;
  onOpenCreateModal: () => void;
}

export default function ListSelector({
  lists,
  selectedListIds,
  onSelectList,
  onDeleteList,
  onDeleteAllItems,
  onReorderLists,
  onOpenCreateModal,
}: ListSelectorProps) {
  const { menuState, openMenu, closeMenu } = useContextMenuState();
  const sensors = useDndSensors({ touchDelay: 200 });
  const [, startTransition] = useTransition();

  // Sort lists with selected ones first
  const sortedLists = useMemo(() => {
    const selected = lists.filter((l) => selectedListIds.includes(l.id));
    const unselected = lists.filter((l) => !selectedListIds.includes(l.id));
    return [...selected, ...unselected];
  }, [lists, selectedListIds]);

  const selectedList = lists.find((list) => list.id === menuState.targetId);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedLists.findIndex((list) => list.id === active.id);
      const newIndex = sortedLists.findIndex((list) => list.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedLists = arrayMove(
        sortedLists,
        oldIndex,
        newIndex
      ) as ShoppingListWithItems[];

      // Update UI optimistically
      startTransition(() => {
        onReorderLists?.(reorderedLists);
      });

      // Persist to server
      const listIds = reorderedLists.map((list) => list.id);
      startTransition(async () => {
        const result = await reorderShoppingLists(listIds);
        if (!result.success) {
          console.error('Failed to reorder lists:', result.error);
        }
      });
    },
    [sortedLists, onReorderLists]
  );

  return (
    <>
      <div className={styles.container}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedLists.map((list) => list.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className={styles.scroller}>
              {sortedLists.map((list) => (
                <SortableListChip
                  key={list.id}
                  list={list}
                  isSelected={selectedListIds.includes(list.id)}
                  onSelect={onSelectList}
                  onContextMenu={openMenu}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button
          type="button"
          className={styles.createButton}
          onClick={onOpenCreateModal}
          aria-label="Utwórz nową listę"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

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
