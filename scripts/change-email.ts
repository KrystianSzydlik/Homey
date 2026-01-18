import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function changeEmail() {
  const oldEmail = process.argv[2];
  const newEmail = process.argv[3];

  if (!oldEmail || !newEmail) {
    console.error(
      '❌ Usage: npx tsx scripts/change-email.ts <old-email> <new-email>'
    );
    console.error(
      'Example: npx tsx scripts/change-email.ts krystian@homey.app krystianszydlik@o2.pl'
    );
    process.exit(1);
  }

  console.log(`📧 Changing email from: ${oldEmail} to: ${newEmail}\n`);

  const user = await prisma.user.findUnique({
    where: { email: oldEmail },
  });

  if (!user) {
    console.error(`❌ User not found: ${oldEmail}`);
    process.exit(1);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser) {
    console.error(`❌ Email already in use: ${newEmail}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email: oldEmail },
    data: { email: newEmail },
  });

  console.log(`✅ Email changed successfully for ${user.name}`);
  console.log(`   Old: ${oldEmail}`);
  console.log(`   New: ${newEmail}`);
}

changeEmail()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
