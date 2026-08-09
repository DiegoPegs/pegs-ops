import { PrismaClient, StockMovementDirection } from '@prisma/client';

const prisma = new PrismaClient();

const ORIGINS = ['MakerWorld', 'Printables', 'STLFlix', 'Patreon', 'Cliente', 'Próprio'];

/** A direção diz ao domínio como aplicar o sinal da quantidade (D-011). */
const STOCK_MOVEMENT_TYPES = [
  { code: 'PRODUCTION', name: 'Produção', direction: StockMovementDirection.IN },
  { code: 'DIRECT_SALE', name: 'Venda Direta', direction: StockMovementDirection.OUT },
  { code: 'ADJUSTMENT', name: 'Ajuste', direction: StockMovementDirection.BOTH },
  { code: 'LOSS', name: 'Perda / Quebra', direction: StockMovementDirection.OUT },
];

async function main() {
  for (const name of ORIGINS) {
    await prisma.origin.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const type of STOCK_MOVEMENT_TYPES) {
    await prisma.stockMovementType.upsert({
      where: { code: type.code },
      update: { name: type.name, direction: type.direction },
      create: type,
    });
  }

  const [origins, movementTypes] = await Promise.all([
    prisma.origin.count(),
    prisma.stockMovementType.count(),
  ]);

  console.log(
    `Seed concluído: ${origins} origens e ${movementTypes} tipos de movimentação disponíveis.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
