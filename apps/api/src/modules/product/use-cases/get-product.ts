import { ProductNotFoundError, type Product, type ProductRepository } from '@pegs-ops/domain';

export async function getProduct(repository: ProductRepository, id: string): Promise<Product> {
  const product = await repository.findById(id);

  if (!product) {
    throw new ProductNotFoundError(id);
  }

  return product;
}
