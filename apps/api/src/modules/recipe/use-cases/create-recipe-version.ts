import {
  RecipeNotFoundError,
  type CreateRecipeVersionData,
  type RecipeRepository,
  type RecipeVersion,
  type RecipeVersionRepository,
} from '@pegs-ops/domain';

/**
 * Uma versão só existe dentro de uma receita. A numeração sequencial e a troca
 * do padrão anterior são responsabilidade do repositório, que faz as duas na
 * mesma transação.
 */
export async function createRecipeVersion(
  versionRepository: RecipeVersionRepository,
  recipeRepository: RecipeRepository,
  recipeId: string,
  input: CreateRecipeVersionData,
): Promise<RecipeVersion> {
  const recipe = await recipeRepository.findById(recipeId);

  if (!recipe) {
    throw new RecipeNotFoundError(recipeId);
  }

  return versionRepository.create(recipeId, input);
}
