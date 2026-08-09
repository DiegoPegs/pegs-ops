import {
  isRecipeArchived,
  RecipeAlreadyArchivedError,
  RecipeNotFoundError,
  type Recipe,
  type RecipeRepository,
} from '@pegs-ops/domain';

/** Arquivamento é lógico: a receita sai da operação, mas permanece no histórico. */
export async function archiveRecipe(repository: RecipeRepository, id: string): Promise<Recipe> {
  const recipe = await repository.findById(id);

  if (!recipe) {
    throw new RecipeNotFoundError(id);
  }

  if (isRecipeArchived(recipe)) {
    throw new RecipeAlreadyArchivedError(id);
  }

  const archived = await repository.archive(id);

  if (!archived) {
    throw new RecipeNotFoundError(id);
  }

  return archived;
}
