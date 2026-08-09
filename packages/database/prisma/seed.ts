import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORIGINS = ['MakerWorld', 'Printables', 'STLFlix', 'Patreon', 'Cliente', 'Próprio'];

async function main() {
  for (const name of ORIGINS) {
    await prisma.origin.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const total = await prisma.origin.count();
  console.log(`Seed concluído: ${total} origens disponíveis.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
