export class RecipeNotFoundError extends Error {
  readonly code = 'RECIPE_NOT_FOUND';

  constructor(readonly recipeId: string) {
    super(`Receita ${recipeId} não encontrada.`);
    this.name = 'RecipeNotFoundError';
  }
}

export class RecipeAlreadyArchivedError extends Error {
  readonly code = 'RECIPE_ALREADY_ARCHIVED';

  constructor(readonly recipeId: string) {
    super(`Receita ${recipeId} já está arquivada.`);
    this.name = 'RecipeAlreadyArchivedError';
  }
}

export class RecipeVersionNotFoundError extends Error {
  readonly code = 'RECIPE_VERSION_NOT_FOUND';

  constructor(readonly versionId: string) {
    super(`Versão de receita ${versionId} não encontrada.`);
    this.name = 'RecipeVersionNotFoundError';
  }
}

export class RecipeVersionAlreadyArchivedError extends Error {
  readonly code = 'RECIPE_VERSION_ALREADY_ARCHIVED';

  constructor(readonly versionId: string) {
    super(`Versão de receita ${versionId} já está arquivada.`);
    this.name = 'RecipeVersionAlreadyArchivedError';
  }
}
