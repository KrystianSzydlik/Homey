import { redirect } from 'next/navigation';
import { getShoppingLists } from '@/app/lib/shopping-list-actions';
import ShoppingList from './components/ShoppingList/ShoppingList';
import { ProductCacheProvider } from './contexts/ProductCacheContext';

// This page uses headers() via getHouseholdId() in server actions,
// so it must be rendered dynamically at request time (cannot be pre-rendered)
export const dynamic = 'force-dynamic';

export default async function ShoppingListPage() {
  const result = await getShoppingLists();

  if (!result.success || !result.lists) {
    redirect('/login');
  }

  return (
    <ProductCacheProvider>
      <ShoppingList initialLists={result.lists} />
    </ProductCacheProvider>
  );
}
