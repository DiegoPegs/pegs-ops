import {
  VariantNotFoundError,
  type UpdateVariantData,
  type VariantRepository,
  type VariantWithAttributes,
} from '@pegs-ops/domain';

export async function updateVariant(
  repository: VariantRepository,
  id: string,
  input: UpdateVariantData,
): Promise<VariantWithAttributes> {
  const variant = await repository.update(id, input);

  if (!variant) {
    throw new VariantNotFoundError(id);
  }

  return variant;
}
