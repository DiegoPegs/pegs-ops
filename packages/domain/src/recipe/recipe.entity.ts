/**
 * Receita: uma estratégia de fabricação de uma Variante
 * (Produção, Alta Qualidade, Feira).
 *
 * A Receita descreve COMO produzir UMA unidade da Variante. Ela não controla
 * produção, estoque nem custos automáticos.
 */
export interface Recipe {
  id: string;
  variantId: string;
  name: string;
  description: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Versão de uma Receita: uma evolução da mesma estratégia.
 *
 * O número da versão é sequencial por Receita, atribuído pelo sistema, e nunca
 * é renumerado ou reaproveitado — as versões formam um histórico.
 */
export interface RecipeVersion {
  id: string;
  recipeId: string;
  version: number;
  printerName: string | null;
  /** Tempo para UMA unidade, sempre em minutos (225, nunca "3h45min"). */
  estimatedPrintTimeMinutes: number | null;
  /** Filamento para UMA unidade, sempre em gramas (185.4). */
  estimatedFilamentGrams: number | null;
  material: string | null;
  /** Custo informado manualmente pelo usuário; nunca calculado (D-008). */
  estimatedCost: number | null;
  /** URL do modelo original — não representa o GCode (D-007). */
  modelSourceUrl: string | null;
  notes: string | null;
  isDefault: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecipeData {
  name: string;
  description?: string | null;
}

export type UpdateRecipeData = Partial<CreateRecipeData>;

export interface CreateRecipeVersionData {
  printerName?: string | null;
  estimatedPrintTimeMinutes?: number | null;
  estimatedFilamentGrams?: number | null;
  material?: string | null;
  estimatedCost?: number | null;
  modelSourceUrl?: string | null;
  notes?: string | null;
  isDefault?: boolean;
}

export type UpdateRecipeVersionData = Partial<CreateRecipeVersionData>;

/** Uma receita arquivada sai da operação, mas continua no histórico. */
export function isRecipeArchived(recipe: Recipe): boolean {
  return recipe.archivedAt !== null;
}

/** Uma versão arquivada sai da operação, mas continua no histórico. */
export function isRecipeVersionArchived(version: RecipeVersion): boolean {
  return version.archivedAt !== null;
}
