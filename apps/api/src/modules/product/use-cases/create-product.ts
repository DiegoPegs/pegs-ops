import type { CreateProductData, ProductRepository, ProductWithOrigin } from '@pegs-ops/domain';

export async function createProduct(
  repository: ProductRepository,
  input: CreateProductData,
): Promise<ProductWithOrigin> {
  return repository.create(input);
}
