import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function changePassword() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.error('❌ Usage: npx tsx scripts/change-password.ts <email> <new-password>')
    console.error('Example: npx tsx scripts/change-password.ts sarka@homey.app MyNewPass123')
    process.exit(1)
  }

  if (newPassword.length < 6) {
    console.error('❌ Password must be at least 6 characters long')
    process.exit(1)
  }

  console.log(`🔐 Changing password for: ${email}\n`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error(`❌ User not found: ${email}`)
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  console.log(`✅ Password changed successfully for ${user.name} (${email})`)
  console.log(`\n🔑 New credentials:`)
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${newPassword}`)
}

changePassword()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
