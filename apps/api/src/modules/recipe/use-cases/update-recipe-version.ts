import {
  RecipeVersionNotFoundError,
  type RecipeVersion,
  type RecipeVersionRepository,
  type UpdateRecipeVersionData,
} from '@pegs-ops/domain';

export async function updateRecipeVersion(
  repository: RecipeVersionRepository,
  id: string,
  input: UpdateRecipeVersionData,
): Promise<RecipeVersion> {
  const version = await repository.update(id, input);

  if (!version) {
    throw new RecipeVersionNotFoundError(id);
  }

  return version;
}
