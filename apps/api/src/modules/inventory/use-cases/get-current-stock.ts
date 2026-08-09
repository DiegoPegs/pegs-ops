import {
  VariantNotFoundError,
  type StockBalance,
  type StockMovementRepository,
  type VariantRepository,
} from '@pegs-ops/domain';

/** O saldo nunca é lido de uma coluna: é a soma das movimentações (D-011). */
export async function getCurrentStock(
  movementRepository: StockMovementRepository,
  variantRepository: VariantRepository,
  variantId: string,
): Promise<StockBalance> {
  const variant = await variantRepository.findById(variantId);

  if (!variant) {
    throw new VariantNotFoundError(variantId);
  }

  return {
    variantId,
    balance: await movementRepository.sumQuantityByVariant(variantId),
  };
}
