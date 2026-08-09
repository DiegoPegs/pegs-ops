import {
  ProductNotFoundError,
  type ListVariantsFilter,
  type ProductRepository,
  type VariantRepository,
  type VariantWithAttributes,
} from '@pegs-ops/domain';

export async function listVariants(
  variantRepository: VariantRepository,
  productRepository: ProductRepository,
  productId: string,
  filter: ListVariantsFilter = {},
): Promise<VariantWithAttributes[]> {
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new ProductNotFoundError(productId);
  }

  return variantRepository.listByProduct(productId, filter);
}
