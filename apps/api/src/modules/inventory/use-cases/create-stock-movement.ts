import {
  resolveSignedQuantity,
  StockMovementTypeNotFoundError,
  VariantNotFoundError,
  type CreateStockMovementData,
  type StockMovementRepository,
  type StockMovementTypeRepository,
  type StockMovementWithType,
  type VariantRepository,
} from '@pegs-ops/domain';

/**
 * Registrar movimentação é a única forma de alterar o saldo (D-011).
 * O sinal vem da direção do tipo, não de quem chama a API.
 */
export async function createStockMovement(
  movementRepository: StockMovementRepository,
  movementTypeRepository: StockMovementTypeRepository,
  variantRepository: VariantRepository,
  input: CreateStockMovementData,
): Promise<StockMovementWithType> {
  const variant = await variantRepository.findById(input.variantId);

  if (!variant) {
    throw new VariantNotFoundError(input.variantId);
  }

  const movementType = await movementTypeRepository.findById(input.movementTypeId);

  if (!movementType) {
    throw new StockMovementTypeNotFoundError(input.movementTypeId);
  }

  return movementRepository.create({
    variantId: input.variantId,
    movementTypeId: movementType.id,
    quantity: resolveSignedQuantity(movementType.direction, input.quantity),
    unitPrice: input.unitPrice ?? null,
    notes: input.notes ?? null,
  });
}
