import type {
  CreateRecipeData,
  CreateRecipeVersionData,
  Recipe,
  RecipeVersion,
  UpdateRecipeData,
  UpdateRecipeVersionData,
} from './recipe.entity.js';

export interface ListRecipesFilter {
  /** Quando true, inclui também as receitas arquivadas. Padrão: false. */
  includeArchived?: boolean;
}

export interface ListRecipeVersionsFilter {
  /** Quando true, inclui também as versões arquivadas. Padrão: false. */
  includeArchived?: boolean;
}

export interface RecipeRepository {
  create(variantId: string, data: CreateRecipeData): Promise<Recipe>;
  update(id: string, data: UpdateRecipeData): Promise<Recipe | null>;
  findById(id: string): Promise<Recipe | null>;
  listByVariant(variantId: string, filter?: ListRecipesFilter): Promise<Recipe[]>;
  archive(id: string): Promise<Recipe | null>;
}

export interface RecipeVersionRepository {
  /**
   * O número da versão é atribuído pela implementação, sequencial por receita.
   * Marcar uma versão como padrão remove o padrão da anterior na mesma receita.
   */
  create(recipeId: string, data: CreateRecipeVersionData): Promise<RecipeVersion>;
  update(id: string, data: UpdateRecipeVersionData): Promise<RecipeVersion | null>;
  findById(id: string): Promise<RecipeVersion | null>;
  listByRecipe(recipeId: string, filter?: ListRecipeVersionsFilter): Promise<RecipeVersion[]>;
  archive(id: string): Promise<RecipeVersion | null>;
  /**
   * Configuração de fabricação vigente da Variante: a versão padrão da receita
   * ativa mais antiga. Resolver qual receita vale é responsabilidade deste
   * módulo — quem consome (Eventos, adiante Produção) apenas pergunta.
   */
  findCurrentByVariant(variantId: string): Promise<RecipeVersionWithRecipe | null>;
}

/** Versão com o nome da receita a que pertence, para exibição em outros módulos. */
export interface RecipeVersionWithRecipe extends RecipeVersion {
  recipe: Pick<Recipe, 'id' | 'name'>;
}
