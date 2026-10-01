import { prisma } from '../src/lib/db';

async function main() {
  // Ensure SQLite database file exists and Prisma client can connect
  await prisma.$connect();
  const userCount = await prisma.user.count();
  console.log(`Database connected. Users in database: ${userCount}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Database setup error:', e);
  process.exit(1);
});