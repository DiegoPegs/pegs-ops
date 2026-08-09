import { InvalidMovementQuantityError } from './inventory.errors.js';
import type { StockMovementDirection } from './stock-movement.entity.js';

/**
 * Aplica o sinal da movimentação a partir da direção configurada no tipo.
 *
 * O cliente sempre informa quantidades positivas; apenas tipos BOTH (Ajuste)
 * aceitam valores negativos. Assim "Produção sempre soma" e "Perda sempre
 * subtrai" são garantidas pelo sistema, e não pela boa vontade de quem chama.
 */
export function resolveSignedQuantity(direction: StockMovementDirection, quantity: number): number {
  if (!Number.isInteger(quantity)) {
    throw new InvalidMovementQuantityError('A quantidade deve ser um número inteiro.');
  }

  if (quantity === 0) {
    throw new InvalidMovementQuantityError('A quantidade não pode ser zero.');
  }

  if (direction === 'BOTH') {
    return quantity;
  }

  if (quantity < 0) {
    throw new InvalidMovementQuantityError(
      'Informe uma quantidade positiva: o sinal vem do tipo da movimentação.',
    );
  }

  return direction === 'OUT' ? -quantity : quantity;
}
