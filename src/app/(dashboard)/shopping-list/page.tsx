import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ShoppingList from './components/ShoppingList/ShoppingList';
import { ProductCacheProvider } from './contexts/ProductCacheContext';

export default async function ShoppingListPage() {
  const session = await auth();
  if (!session?.user?.householdId) {
    redirect('/login');
  }

  const householdId = session.user.householdId;

  let lists = await prisma.shoppingList.findMany({
    where: { householdId },
    orderBy: { position: 'asc' },
    include: {
      items: {
        orderBy: { position: 'asc' },
        include: {
          createdBy: {
            select: { name: true },
          },
          shoppingList: {
            select: { name: true, emoji: true },
          },
          product: {
            select: { name: true, emoji: true },
          },
        },
      },
      createdBy: {
        select: { name: true },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  return (
    <ProductCacheProvider>
      <ShoppingList initialLists={lists} />
    </ProductCacheProvider>
  );
}

//TODO: Najpierw tworzysz listę, później tworzysz produkt na liście.

//TODO: zmiana dodawania produktu na jeden input z podpowiedziami produktów. Pozbycie się inputów na ilość i jednostkę. Zamiast tego już po dodaniu produktu do listy, opcjonalnie można klikąć na pustą rubrykę ilość, gdzie można sobie wpisać w jednym polu np. 2kg, 3 sztuki, itp.

//TODO: Możliwość dodawania nowych kart/list zakupowych.

//TODO: Możliwość filtrowania po tych kartach/listach zakupowych.

//TODO: Możliwość filtrowania po listach zakupowych typu: mercus i warzywniak (wyświetlamy dwie listy)

//TODO: Mozliwość usunięcia wszystkich produktów z listy z wczesniejszym potwierdzeniem.

//TODO: Możliwość usunięcia pojedyńczego produktu z listy (typu jednak nie chce bananów to je usuwam)

//TODO: Ma być baza danych z produktami, którą można powiększać o produkty dodając nowy (sugestie, mądre podpowiedzi, statystyki).

//TODO: Zrobienie kompletnego CRUD'a front->prisma->db->front

//TODO: Możliwość opcjonalnego dodania ceny produktu w złotówkach (dopiero dla produktu, który juz jest na liście) i mądre porównania typu w mercus banany 500g były za 8zł a w warzywniaku banany 500g po 4zł, pokazanie oszczędności i tworzenie statystyk tygodniowych,miesiecznych,kwartalnych
