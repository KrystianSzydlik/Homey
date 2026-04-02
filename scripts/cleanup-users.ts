import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/cleanup-users.ts <email>')
    console.error('Example: npx tsx scripts/cleanup-users.ts user@example.com')
    process.exit(1)
  }

  const deleted = await prisma.user.deleteMany({
    where: { email }
  })

  console.log(`Deleted ${deleted.count} user(s) with email: ${email}`)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      email: 'asc'
    }
  })

  console.log('\nRemaining users:')
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name} (${user.email})`)
  })
}

cleanup()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
