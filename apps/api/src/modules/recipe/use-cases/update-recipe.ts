import {
  RecipeNotFoundError,
  type Recipe,
  type RecipeRepository,
  type UpdateRecipeData,
} from '@pegs-ops/domain';

export async function updateRecipe(
  repository: RecipeRepository,
  id: string,
  input: UpdateRecipeData,
): Promise<Recipe> {
  const recipe = await repository.update(id, input);

  if (!recipe) {
    throw new RecipeNotFoundError(id);
  }

  return recipe;
}
