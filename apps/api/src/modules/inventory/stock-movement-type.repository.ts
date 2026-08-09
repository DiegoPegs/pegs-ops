import { prisma } from '@pegs-ops/database';
import type { StockMovementType, StockMovementTypeRepository } from '@pegs-ops/domain';

export class PrismaStockMovementTypeRepository implements StockMovementTypeRepository {
  async list(): Promise<StockMovementType[]> {
    return prisma.stockMovementType.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<StockMovementType | null> {
    return prisma.stockMovementType.findUnique({ where: { id } });
  }
}
