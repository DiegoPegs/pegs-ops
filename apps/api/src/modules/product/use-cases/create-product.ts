import type { CreateProductData, Product, ProductRepository } from '@pegs-ops/domain';

export async function createProduct(
  repository: ProductRepository,
  input: CreateProductData,
): Promise<Product> {
  return repository.create(input);
}
