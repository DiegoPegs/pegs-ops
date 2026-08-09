export class VariantNotFoundError extends Error {
  readonly code = 'VARIANT_NOT_FOUND';

  constructor(readonly variantId: string) {
    super(`Variante ${variantId} não encontrada.`);
    this.name = 'VariantNotFoundError';
  }
}

export class VariantAlreadyArchivedError extends Error {
  readonly code = 'VARIANT_ALREADY_ARCHIVED';

  constructor(readonly variantId: string) {
    super(`Variante ${variantId} já está arquivada.`);
    this.name = 'VariantAlreadyArchivedError';
  }
}
