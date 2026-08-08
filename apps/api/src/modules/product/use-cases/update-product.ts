import {
  ProductNotFoundError,
  type Product,
  type ProductRepository,
  type UpdateProductData,
} from '@pegs-ops/domain';

export async function updateProduct(
  repository: ProductRepository,
  id: string,
  input: UpdateProductData,
): Promise<Product> {
  const product = await repository.update(id, input);

  if (!product) {
    throw new ProductNotFoundError(id);
  }

  return product;
}
