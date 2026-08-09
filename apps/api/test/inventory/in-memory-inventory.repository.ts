import { randomUUID } from 'node:crypto';

import type {
  PersistStockMovementData,
  StockMovementRepository,
  StockMovementType,
  StockMovementTypeRepository,
  StockMovementWithType,
} from '@pegs-ops/domain';

/** Os quatro tipos do seed, com as direções configuradas no banco. */
export const MOVEMENT_TYPES: StockMovementType[] = [
  { id: randomUUID(), code: 'PRODUCTION', name: 'Produção', direction: 'IN' },
  { id: randomUUID(), code: 'DIRECT_SALE', name: 'Venda Direta', direction: 'OUT' },
  { id: randomUUID(), code: 'ADJUSTMENT', name: 'Ajuste', direction: 'BOTH' },
  { id: randomUUID(), code: 'LOSS', name: 'Perda / Quebra', direction: 'OUT' },
];

export function movementTypeByCode(code: string): StockMovementType {
  const type = MOVEMENT_TYPES.find((item) => item.code === code);
  if (!type) throw new Error(`Tipo ${code} não existe no dublê.`);

  return type;
}

export class InMemoryStockMovementTypeRepository implements StockMovementTypeRepository {
  async list(): Promise<StockMovementType[]> {
    return MOVEMENT_TYPES;
  }

  async findById(id: string): Promise<StockMovementType | null> {
    return MOVEMENT_TYPES.find((item) => item.id === id) ?? null;
  }
}

export class InMemoryStockMovementRepository implements StockMovementRepository {
  readonly items: StockMovementWithType[] = [];

  async create(data: PersistStockMovementData): Promise<StockMovementWithType> {
    const movementType = MOVEMENT_TYPES.find((item) => item.id === data.movementTypeId);
    if (!movementType) throw new Error('Tipo de movimentação inexistente no dublê.');

    const movement: StockMovementWithType = {
      id: randomUUID(),
      variantId: data.variantId,
      movementTypeId: data.movementTypeId,
      quantity: data.quantity,
      unitPrice: data.unitPrice ?? null,
      notes: data.notes ?? null,
      createdAt: new Date(Date.now() + this.items.length),
      movementType,
    };

    this.items.push(movement);

    return movement;
  }

  async listByVariant(variantId: string): Promise<StockMovementWithType[]> {
    return this.items
      .filter((item) => item.variantId === variantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async sumQuantityByVariant(variantId: string): Promise<number> {
    return this.items
      .filter((item) => item.variantId === variantId)
      .reduce((total, item) => total + item.quantity, 0);
  }
}
