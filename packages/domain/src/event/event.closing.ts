import { InvalidEventClosingQuantityError } from './event.errors.js';

/** O que o operador informa por item ao encerrar o evento. */
export interface EventItemClosing {
  itemId: string;
  takenQuantity: number;
  returnedQuantity: number;
}

/** Resultado do item após o encerramento. */
export interface EventItemClosingResult extends EventItemClosing {
  variantId: string;
  soldQuantity: number;
}

/**
 * Vendido é o que saiu e não voltou.
 *
 * Encerrar um evento não cria Venda, Pedido nem registro financeiro: apenas
 * reflete a saída física do estoque.
 */
export function calculateSoldQuantity(takenQuantity: number, returnedQuantity: number): number {
  return takenQuantity - returnedQuantity;
}

/**
 * Valida as quantidades de um item. Quem chama deve validar todos os itens
 * antes de gravar qualquer movimentação — um encerramento pela metade deixaria
 * o estoque descrevendo um evento que não aconteceu assim.
 */
export function assertValidClosing(closing: EventItemClosing): void {
  const { takenQuantity, returnedQuantity } = closing;

  if (!Number.isInteger(takenQuantity) || !Number.isInteger(returnedQuantity)) {
    throw new InvalidEventClosingQuantityError('As quantidades devem ser números inteiros.');
  }

  if (takenQuantity < 0 || returnedQuantity < 0) {
    throw new InvalidEventClosingQuantityError('As quantidades não podem ser negativas.');
  }

  if (returnedQuantity > takenQuantity) {
    throw new InvalidEventClosingQuantityError(
      'A quantidade retornada não pode ser maior que a levada.',
    );
  }
}
