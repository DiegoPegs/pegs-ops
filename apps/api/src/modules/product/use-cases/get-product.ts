import {
  ProductNotFoundError,
  type ProductWithOrigin,
  type ProductRepository,
} from '@pegs-ops/domain';

export async function getProduct(
  repository: ProductRepository,
  id: string,
): Promise<ProductWithOrigin> {
  const product = await repository.findById(id);

  if (!product) {
    throw new ProductNotFoundError(id);
  }

  return product;
}
