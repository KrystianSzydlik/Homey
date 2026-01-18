import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const householdName = 'Nasze Gospodarstwo';

  // 1. Create or get Household
  let household = await prisma.household.findFirst({
    where: { name: householdName },
  });

  if (!household) {
    household = await prisma.household.create({
      data: { name: householdName },
    });
    console.log(`Created household: ${household.name}`);
  } else {
    console.log(`Household already exists: ${household.name}`);
  }

  // 2. Create Users
  // Password is 'password' - CHANGE THIS IN PRODUCTION
  const passwordHash =
    '$2b$10$M3qjfV64Lq.MXAbztBGL0Oroez4rZDuwqHSPOm5Jp5.tVFADrcd36';

  const users = [
    { email: 'krystianszydlik@o2.pl', name: 'Krystian' },
    { email: 'saralekka@proton.me', name: 'Sarka' },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: passwordHash,
        householdId: household.id,
      },
    });
    console.log(`Upserted user: ${user.name} (${user.email})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
