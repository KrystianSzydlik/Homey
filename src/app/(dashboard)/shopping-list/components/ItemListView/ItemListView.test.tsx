import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemListView from './ItemListView';
import { ShoppingItemWithCreator } from '@/types/shopping';

const shoppingItemSpy = vi.fn(
  ({
    item,
    sortable,
    sourceList,
  }: {
    item: ShoppingItemWithCreator;
    sortable?: boolean;
    sourceList?: { name: string };
  }) => (
    <div
      data-testid={`shopping-item-${item.id}`}
      data-sortable={sortable ? 'true' : 'false'}
      data-source-list={sourceList?.name || ''}
    >
      {item.name}
    </div>
  )
);

vi.mock('../ShoppingItem/ShoppingItem', () => ({
  default: (props: Parameters<typeof shoppingItemSpy>[0]) => shoppingItemSpy(props),
}));

vi.mock('@/components/shared/Modal', () => ({
  AlertModal: ({
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="alert-modal">
      <p>{title}</p>
      <p>{message}</p>
      <button type="button" onClick={onConfirm}>
        Confirm
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

vi.mock('../../hooks/useDndSensors', () => ({
  useDndSensors: () => [],
}));

vi.mock('@/app/lib/shopping-actions', () => ({
  reorderShoppingItems: vi.fn().mockResolvedValue({ success: true }),
}));

function createItem(
  overrides: Partial<ShoppingItemWithCreator>
): ShoppingItemWithCreator {
  return {
    id: 'item-1',
    name: 'Produkt',
    quantity: '1',
    unit: 'szt',
    category: 'OTHER',
    checked: false,
    position: 0,
    emoji: '🛒',
    price: null,
    purchaseCount: 0,
    lastPurchasedAt: null,
    averageDaysBetweenPurchases: null,
    shoppingListId: 'list-1',
    productId: 'product-1',
    householdId: 'household-1',
    createdById: 'user-1',
    currency: 'PLN',
    purchasedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { name: 'Test User' },
    ...overrides,
  };
}

describe('ItemListView', () => {
  const onDeleteItem = vi.fn();
  const onUpdateItem = vi.fn();
  const onToggleItem = vi.fn();
  const onClearCheckedItems = vi.fn();
  const onReorderItems = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders unchecked items grouped by category', () => {
    render(
      <ItemListView
        items={[
          createItem({ id: 'veg-1', name: 'Marchewka', category: 'VEGETABLES' }),
          createItem({ id: 'dairy-1', name: 'Mleko', category: 'DAIRY' }),
          createItem({ id: 'veg-2', name: 'Sałata', category: 'VEGETABLES' }),
        ]}
        listId="list-1"
        onDeleteItem={onDeleteItem}
        onUpdateItem={onUpdateItem}
        onToggleItem={onToggleItem}
        onClearCheckedItems={onClearCheckedItems}
      />
    );

    expect(screen.getByText('Warzywa')).toBeInTheDocument();
    expect(screen.getByText('Nabiał')).toBeInTheDocument();
    expect(screen.getByText('Marchewka')).toBeInTheDocument();
    expect(screen.getByText('Sałata')).toBeInTheDocument();
    expect(screen.getByText('Mleko')).toBeInTheDocument();
  });

  it('shows filtered empty state when selected category has no items', () => {
    render(
      <ItemListView
        items={[createItem({ id: 'dairy-1', name: 'Mleko', category: 'DAIRY' })]}
        listId="list-1"
        onDeleteItem={onDeleteItem}
        onUpdateItem={onUpdateItem}
        onToggleItem={onToggleItem}
        onClearCheckedItems={onClearCheckedItems}
        selectedCategory="FRUITS"
      />
    );

    expect(screen.getByText('Brak produktów w tej kategorii')).toBeInTheDocument();
    expect(
      screen.getByText('Wybierz inną kategorię albo dodaj produkt do tej sekcji.')
    ).toBeInTheDocument();
  });

  it('shows warning modal before clearing completed items without prices', async () => {
    const user = userEvent.setup();

    render(
      <ItemListView
        items={[
          createItem({
            id: 'checked-1',
            name: 'Masło',
            category: 'DAIRY',
            checked: true,
            price: null,
          }),
        ]}
        listId="list-1"
        onDeleteItem={onDeleteItem}
        onUpdateItem={onUpdateItem}
        onToggleItem={onToggleItem}
        onClearCheckedItems={onClearCheckedItems}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Wyczyść' }));

    expect(screen.getByTestId('alert-modal')).toBeInTheDocument();
    expect(screen.getByText('Brakujące ceny')).toBeInTheDocument();
    expect(onClearCheckedItems).not.toHaveBeenCalled();
  });

  it('clears completed items immediately when all prices are present', async () => {
    const user = userEvent.setup();

    render(
      <ItemListView
        items={[
          createItem({
            id: 'checked-1',
            name: 'Masło',
            category: 'DAIRY',
            checked: true,
            price: 8.99,
          }),
        ]}
        listId="list-1"
        onDeleteItem={onDeleteItem}
        onUpdateItem={onUpdateItem}
        onToggleItem={onToggleItem}
        onClearCheckedItems={onClearCheckedItems}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Wyczyść' }));

    expect(onClearCheckedItems).toHaveBeenCalledWith(['checked-1']);
    expect(screen.queryByTestId('alert-modal')).not.toBeInTheDocument();
  });

  it('passes source list metadata and disables sorting in combined view', () => {
    render(
      <ItemListView
        items={[createItem({ id: 'item-1', name: 'Płatki', category: 'OTHER' })]}
        listId="list-1"
        onDeleteItem={onDeleteItem}
        onUpdateItem={onUpdateItem}
        onToggleItem={onToggleItem}
        onClearCheckedItems={onClearCheckedItems}
        sourceListMap={
          new Map([
            ['item-1', { id: 'list-2', name: 'Spiżarnia', emoji: '📦' }],
          ])
        }
      />
    );

    const item = screen.getByTestId('shopping-item-item-1');
    expect(item).toHaveAttribute('data-sortable', 'false');
    expect(item).toHaveAttribute('data-source-list', 'Spiżarnia');
    expect(onReorderItems).not.toHaveBeenCalled();
  });
});
