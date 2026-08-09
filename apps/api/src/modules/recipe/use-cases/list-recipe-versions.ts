import {
  RecipeNotFoundError,
  type ListRecipeVersionsFilter,
  type RecipeRepository,
  type RecipeVersion,
  type RecipeVersionRepository,
} from '@pegs-ops/domain';

export async function listRecipeVersions(
  versionRepository: RecipeVersionRepository,
  recipeRepository: RecipeRepository,
  recipeId: string,
  filter: ListRecipeVersionsFilter = {},
): Promise<RecipeVersion[]> {
  const recipe = await recipeRepository.findById(recipeId);

  if (!recipe) {
    throw new RecipeNotFoundError(recipeId);
  }

  return versionRepository.listByRecipe(recipeId, filter);
}
