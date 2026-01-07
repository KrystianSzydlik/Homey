import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Cleaning up duplicate users...\n')

  // Delete old user with email 'partner@homey.app'
  const deleted = await prisma.user.deleteMany({
    where: {
      email: 'partner@homey.app'
    }
  })

  console.log(`✅ Deleted ${deleted.count} user(s) with email: partner@homey.app`)

  // Show all remaining users
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

  console.log('\n📋 Remaining users:')
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
