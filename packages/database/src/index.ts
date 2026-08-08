import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Instância única do PrismaClient.
 * Em desenvolvimento é reaproveitada entre recarregamentos para evitar
 * esgotar o pool de conexões do PostgreSQL.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: prismaLogLevels(),
  });

function prismaLogLevels(): ('warn' | 'error')[] {
  if (process.env.NODE_ENV === 'test') return [];
  if (process.env.NODE_ENV === 'development') return ['warn', 'error'];
  return ['error'];
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export type * from '@prisma/client';
