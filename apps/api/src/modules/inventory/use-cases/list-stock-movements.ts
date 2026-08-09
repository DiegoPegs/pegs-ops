import {
  VariantNotFoundError,
  type StockMovementRepository,
  type StockMovementWithType,
  type VariantRepository,
} from '@pegs-ops/domain';

/** Histórico da variante, do mais recente para o mais antigo. */
export async function listStockMovements(
  movementRepository: StockMovementRepository,
  variantRepository: VariantRepository,
  variantId: string,
): Promise<StockMovementWithType[]> {
  const variant = await variantRepository.findById(variantId);

  if (!variant) {
    throw new VariantNotFoundError(variantId);
  }

  return movementRepository.listByVariant(variantId);
}
