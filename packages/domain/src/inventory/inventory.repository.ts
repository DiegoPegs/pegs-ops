import type {
  StockMovement,
  StockMovementType,
  StockMovementWithType,
} from './stock-movement.entity.js';

/** Dados já validados pelo domínio: quantity chega com o sinal aplicado. */
export interface PersistStockMovementData {
  variantId: string;
  movementTypeId: string;
  quantity: number;
  unitPrice?: number | null;
  notes?: string | null;
}

export interface StockMovementRepository {
  create(data: PersistStockMovementData): Promise<StockMovementWithType>;
  /** Histórico da variante, do mais recente para o mais antigo. */
  listByVariant(variantId: string): Promise<StockMovementWithType[]>;
  /** Saldo calculado: soma das quantidades da variante. Nunca é armazenado. */
  sumQuantityByVariant(variantId: string): Promise<number>;
}

export interface StockMovementTypeRepository {
  list(): Promise<StockMovementType[]>;
  findById(id: string): Promise<StockMovementType | null>;
}

export type { StockMovement };
