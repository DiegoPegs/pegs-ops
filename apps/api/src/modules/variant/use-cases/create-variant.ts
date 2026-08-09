import {
  ProductNotFoundError,
  type CreateVariantData,
  type ProductRepository,
  type VariantRepository,
  type VariantWithAttributes,
} from '@pegs-ops/domain';

/** Uma variante só existe dentro de um produto; o produto é validado antes. */
export async function createVariant(
  variantRepository: VariantRepository,
  productRepository: ProductRepository,
  productId: string,
  input: CreateVariantData,
): Promise<VariantWithAttributes> {
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new ProductNotFoundError(productId);
  }

  return variantRepository.create(productId, input);
}
