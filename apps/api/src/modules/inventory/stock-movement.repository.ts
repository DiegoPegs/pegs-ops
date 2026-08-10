import { prisma } from '@pegs-ops/database';
import type {
  PersistStockMovementData,
  StockMovementRepository,
  StockMovementWithType,
} from '@pegs-ops/domain';

/** O Decimal do Prisma não vaza do repositório: o domínio trabalha com number. */
interface Decimalish {
  toNumber(): number;
}

type StockMovementRow = Omit<StockMovementWithType, 'unitPrice'> & {
  unitPrice: Decimalish | null;
};

function toDomain(row: StockMovementRow): StockMovementWithType {
  return { ...row, unitPrice: row.unitPrice?.toNumber() ?? null };
}

const withType = { movementType: true } as const;

export class PrismaStockMovementRepository implements StockMovementRepository {
  async create(data: PersistStockMovementData): Promise<StockMovementWithType> {
    const created = await prisma.stockMovement.create({
      data: {
        variantId: data.variantId,
        movementTypeId: data.movementTypeId,
        quantity: data.quantity,
        unitPrice: data.unitPrice ?? null,
        notes: data.notes ?? null,
      },
      include: withType,
    });

    return toDomain(created);
  }

  async listByVariant(variantId: string): Promise<StockMovementWithType[]> {
    const rows = await prisma.stockMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
      include: withType,
    });

    return rows.map(toDomain);
  }

  /**
   * Saldo é sempre calculado (D-011): somamos as quantidades no banco, sem
   * materializar nenhum campo de estoque.
   */
  async sumQuantityByVariant(variantId: string): Promise<number> {
    const result = await prisma.stockMovement.aggregate({
      where: { variantId },
      _sum: { quantity: true },
    });

    return result._sum.quantity ?? 0;
  }

  async listByTypeCodeBetween(
    code: string,
    start: Date,
    end: Date,
  ): Promise<StockMovementWithType[]> {
    const rows = await prisma.stockMovement.findMany({
      where: {
        movementType: { code },
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: 'desc' },
      include: withType,
    });

    return rows.map(toDomain);
  }
}
