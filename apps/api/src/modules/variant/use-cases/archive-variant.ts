import {
  isVariantArchived,
  VariantAlreadyArchivedError,
  VariantNotFoundError,
  type VariantRepository,
  type VariantWithAttributes,
} from '@pegs-ops/domain';

/** Arquivamento é lógico: a variante sai da operação, mas permanece no histórico. */
export async function archiveVariant(
  repository: VariantRepository,
  id: string,
): Promise<VariantWithAttributes> {
  const variant = await repository.findById(id);

  if (!variant) {
    throw new VariantNotFoundError(id);
  }

  if (isVariantArchived(variant)) {
    throw new VariantAlreadyArchivedError(id);
  }

  const archived = await repository.archive(id);

  if (!archived) {
    throw new VariantNotFoundError(id);
  }

  return archived;
}
