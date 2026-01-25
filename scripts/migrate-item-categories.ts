import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateItemCategories() {
  console.log('Starting category migration...');

  const items = await prisma.shoppingItem.findMany({
    include: {
      product: {
        select: { defaultCategory: true, name: true },
      },
    },
  });

  console.log(`Found ${items.length} shopping items to check`);

  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    if (item.product && item.category !== item.product.defaultCategory) {
      console.log(
        `Updating "${item.name}": ${item.category} -> ${item.product.defaultCategory}`
      );
      await prisma.shoppingItem.update({
        where: { id: item.id },
        data: { category: item.product.defaultCategory },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Updated: ${updated} items`);
  console.log(`  Skipped: ${skipped} items (already correct)`);
}

migrateItemCategories()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
