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
    '$2b$10$MTDORiGbNS28JgfqiOnd1.pRVmcLoUiZF0IchjZHclaeDQyr5hM8m'; // Hash for 'password'

  const users = [
    { email: 'user1@example.com', name: 'User One' },
    { email: 'user2@example.com', name: 'User Two' },
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
