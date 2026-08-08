import type { ListProductsFilter, Product, ProductRepository } from '@pegs-ops/domain';

export async function listProducts(
  repository: ProductRepository,
  filter: ListProductsFilter = {},
): Promise<Product[]> {
  return repository.list(filter);
}
