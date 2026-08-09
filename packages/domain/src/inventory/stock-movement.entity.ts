/**
 * Efeito de um tipo de movimentação sobre o saldo.
 *
 * IN sempre soma, OUT sempre subtrai e BOTH aceita os dois sentidos. A direção
 * vive no banco, junto do tipo, para que novos tipos possam ser cadastrados sem
 * deploy.
 */
export type StockMovementDirection = 'IN' | 'OUT' | 'BOTH';

export interface StockMovementType {
  id: string;
  code: string;
  name: string;
  direction: StockMovementDirection;
}

/**
 * Movimentação de estoque de uma Variante.
 *
 * O saldo nunca é armazenado: ele é a soma das movimentações (D-011). Por isso
 * uma movimentação é imutável — corrigir significa registrar um Ajuste.
 */
export interface StockMovement {
  id: string;
  variantId: string;
  movementTypeId: string;
  /** Já com o sinal aplicado: positivo soma, negativo subtrai. */
  quantity: number;
  unitPrice: number | null;
  notes: string | null;
  createdAt: Date;
}

/** Movimentação com o tipo resolvido, como trafega nas leituras. */
export interface StockMovementWithType extends StockMovement {
  movementType: StockMovementType;
}

export interface CreateStockMovementData {
  variantId: string;
  movementTypeId: string;
  /**
   * Quantidade como o usuário informa: sempre positiva, exceto para tipos
   * BOTH (Ajuste), que aceitam valores negativos.
   */
  quantity: number;
  unitPrice?: number | null;
  notes?: string | null;
}

/** Saldo de uma Variante, sempre calculado a partir das movimentações. */
export interface StockBalance {
  variantId: string;
  balance: number;
}
