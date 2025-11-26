import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const householdName = 'homey-main';

  let household = await prisma.household.findFirst({
    where: { name: householdName },
  });

  if (!household) {
    household = await prisma.household.create({
      data: { name: householdName },
    });
  }

  const users = [
    {
      email: 'twoj@email.com',
      name: 'Ty',
      passwordHash: '$2a$10$TUTAJ_WKLEJ_HASH',
    },
    {
      email: 'partner@email.com',
      name: 'Partnerka',
      passwordHash: '$2a$10$TUTAJ_WKLEJ_HASH',
    },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          password: u.passwordHash,
          householdId: household.id,
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
