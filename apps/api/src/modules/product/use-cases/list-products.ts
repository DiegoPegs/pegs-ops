import type { ListProductsFilter, ProductRepository, ProductWithOrigin } from '@pegs-ops/domain';

export async function listProducts(
  repository: ProductRepository,
  filter: ListProductsFilter = {},
): Promise<ProductWithOrigin[]> {
  return repository.list(filter);
}
