import {
  VariantNotFoundError,
  type ListRecipesFilter,
  type Recipe,
  type RecipeRepository,
  type VariantRepository,
} from '@pegs-ops/domain';

export async function listRecipes(
  recipeRepository: RecipeRepository,
  variantRepository: VariantRepository,
  variantId: string,
  filter: ListRecipesFilter = {},
): Promise<Recipe[]> {
  const variant = await variantRepository.findById(variantId);

  if (!variant) {
    throw new VariantNotFoundError(variantId);
  }

  return recipeRepository.listByVariant(variantId, filter);
}
