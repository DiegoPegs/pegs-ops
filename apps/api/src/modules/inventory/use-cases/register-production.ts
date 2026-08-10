import {
  InvalidMovementQuantityError,
  PRODUCTION_MOVEMENT_CODE,
  resolveSignedQuantity,
  StockMovementTypeNotFoundError,
  VariantNotFoundError,
  type StockMovementRepository,
  type StockMovementTypeRepository,
  type StockMovementWithType,
  type VariantRepository,
} from '@pegs-ops/domain';

export interface RegisterProductionData {
  variantId: string;
  /** Quantidade produzida, sempre positiva. */
  quantity: number;
}

/**
 * Registro rápido de produção.
 *
 * Produzir não cria entidade nova: é uma movimentação de estoque do tipo
 * PRODUCTION, e nenhum outro tipo é aceito aqui. O restante — saldo, produção
 * pendente, insights — é consequência, porque a Central apenas observa o novo
 * estado do sistema.
 */
export async function registerProduction(
  movementRepository: StockMovementRepository,
  movementTypeRepository: StockMovementTypeRepository,
  variantRepository: VariantRepository,
  input: RegisterProductionData,
): Promise<StockMovementWithType> {
  const variant = await variantRepository.findById(input.variantId);

  if (!variant) {
    throw new VariantNotFoundError(input.variantId);
  }

  if (input.quantity <= 0) {
    throw new InvalidMovementQuantityError('Informe uma quantidade produzida maior que zero.');
  }

  const movementType = await movementTypeRepository.findByCode(PRODUCTION_MOVEMENT_CODE);

  if (!movementType) {
    throw new StockMovementTypeNotFoundError(PRODUCTION_MOVEMENT_CODE);
  }

  return movementRepository.create({
    variantId: input.variantId,
    movementTypeId: movementType.id,
    quantity: resolveSignedQuantity(movementType.direction, input.quantity),
    unitPrice: null,
    notes: null,
  });
}
