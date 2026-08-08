import {
  isArchived,
  ProductAlreadyArchivedError,
  ProductNotFoundError,
  type ProductWithOrigin,
  type ProductRepository,
} from '@pegs-ops/domain';

/** Arquivamento é lógico: o produto sai da operação, mas permanece no histórico. */
export async function archiveProduct(
  repository: ProductRepository,
  id: string,
): Promise<ProductWithOrigin> {
  const product = await repository.findById(id);

  if (!product) {
    throw new ProductNotFoundError(id);
  }

  if (isArchived(product)) {
    throw new ProductAlreadyArchivedError(id);
  }

  const archived = await repository.archive(id);

  if (!archived) {
    throw new ProductNotFoundError(id);
  }

  return archived;
}
