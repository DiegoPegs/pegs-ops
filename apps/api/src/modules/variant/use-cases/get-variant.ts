import {
  VariantNotFoundError,
  type VariantRepository,
  type VariantWithAttributes,
} from '@pegs-ops/domain';

export async function getVariant(
  repository: VariantRepository,
  id: string,
): Promise<VariantWithAttributes> {
  const variant = await repository.findById(id);

  if (!variant) {
    throw new VariantNotFoundError(id);
  }

  return variant;
}
