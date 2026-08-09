import {
  isRecipeVersionArchived,
  RecipeVersionAlreadyArchivedError,
  RecipeVersionNotFoundError,
  type RecipeVersion,
  type RecipeVersionRepository,
} from '@pegs-ops/domain';

/** Arquivamento é lógico: a versão sai da operação, mas permanece no histórico. */
export async function archiveRecipeVersion(
  repository: RecipeVersionRepository,
  id: string,
): Promise<RecipeVersion> {
  const version = await repository.findById(id);

  if (!version) {
    throw new RecipeVersionNotFoundError(id);
  }

  if (isRecipeVersionArchived(version)) {
    throw new RecipeVersionAlreadyArchivedError(id);
  }

  const archived = await repository.archive(id);

  if (!archived) {
    throw new RecipeVersionNotFoundError(id);
  }

  return archived;
}
