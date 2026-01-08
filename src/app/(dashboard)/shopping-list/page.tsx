import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ShoppingList from './components/ShoppingList/ShoppingList';

export default async function ShoppingListPage() {
  const session = await auth();
  if (!session?.user?.householdId) {
    redirect('/login');
  }

  const items = await prisma.shoppingItem.findMany({
    where: { householdId: session.user.householdId },
    orderBy: { position: 'asc' },
    include: {
      createdBy: {
        select: { name: true },
      },
    },
  });

  return <ShoppingList initialItems={items} />;
}
