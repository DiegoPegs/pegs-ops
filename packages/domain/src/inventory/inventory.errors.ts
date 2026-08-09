export class StockMovementTypeNotFoundError extends Error {
  readonly code = 'STOCK_MOVEMENT_TYPE_NOT_FOUND';

  constructor(readonly movementTypeId: string) {
    super(`Tipo de movimentação ${movementTypeId} não encontrado.`);
    this.name = 'StockMovementTypeNotFoundError';
  }
}

export class InvalidMovementQuantityError extends Error {
  readonly code = 'INVALID_MOVEMENT_QUANTITY';

  constructor(message: string) {
    super(message);
    this.name = 'InvalidMovementQuantityError';
  }
}
