import {
  VariantNotFoundError,
  type CreateRecipeData,
  type Recipe,
  type RecipeRepository,
  type VariantRepository,
} from '@pegs-ops/domain';

/** Uma receita só existe dentro de uma variante; a variante é validada antes. */
export async function createRecipe(
  recipeRepository: RecipeRepository,
  variantRepository: VariantRepository,
  variantId: string,
  input: CreateRecipeData,
): Promise<Recipe> {
  const variant = await variantRepository.findById(variantId);

  if (!variant) {
    throw new VariantNotFoundError(variantId);
  }

  return recipeRepository.create(variantId, input);
}
