export class ProductNotFoundError extends Error {
  readonly code = 'PRODUCT_NOT_FOUND';

  constructor(readonly productId: string) {
    super(`Produto ${productId} não encontrado.`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductAlreadyArchivedError extends Error {
  readonly code = 'PRODUCT_ALREADY_ARCHIVED';

  constructor(readonly productId: string) {
    super(`Produto ${productId} já está arquivado.`);
    this.name = 'ProductAlreadyArchivedError';
  }
}
