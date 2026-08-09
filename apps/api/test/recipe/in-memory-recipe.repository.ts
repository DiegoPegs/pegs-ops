import { randomUUID } from 'node:crypto';

import type {
  CreateRecipeData,
  CreateRecipeVersionData,
  ListRecipeVersionsFilter,
  ListRecipesFilter,
  Recipe,
  RecipeRepository,
  RecipeVersion,
  RecipeVersionRepository,
  UpdateRecipeData,
  UpdateRecipeVersionData,
} from '@pegs-ops/domain';

export class InMemoryRecipeRepository implements RecipeRepository {
  readonly items: Recipe[] = [];

  async create(variantId: string, data: CreateRecipeData): Promise<Recipe> {
    const now = new Date();
    const recipe: Recipe = {
      id: randomUUID(),
      variantId,
      name: data.name,
      description: data.description ?? null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(recipe);

    return recipe;
  }

  async update(id: string, data: UpdateRecipeData): Promise<Recipe | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated: Recipe = {
      ...this.items[index]!,
      ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
      updatedAt: new Date(),
    };

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<Recipe | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async listByVariant(variantId: string, filter: ListRecipesFilter = {}): Promise<Recipe[]> {
    return this.items
      .filter((item) => item.variantId === variantId)
      .filter((item) => (filter.includeArchived ? true : item.archivedAt === null))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async archive(id: string): Promise<Recipe | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const archived: Recipe = { ...this.items[index]!, archivedAt: new Date() };
    this.items[index] = archived;

    return archived;
  }
}

export class InMemoryRecipeVersionRepository implements RecipeVersionRepository {
  readonly items: RecipeVersion[] = [];

  /** Reproduz a numeração sequencial e a troca de padrão do repositório Prisma. */
  async create(recipeId: string, data: CreateRecipeVersionData): Promise<RecipeVersion> {
    const now = new Date();
    const daReceita = this.items.filter((item) => item.recipeId === recipeId);
    const maiorVersao = daReceita.reduce((maior, item) => Math.max(maior, item.version), 0);
    const isDefault = data.isDefault === true || daReceita.length === 0;

    if (isDefault) {
      this.clearDefault(recipeId);
    }

    const version: RecipeVersion = {
      id: randomUUID(),
      recipeId,
      version: maiorVersao + 1,
      printerName: data.printerName ?? null,
      estimatedPrintTimeMinutes: data.estimatedPrintTimeMinutes ?? null,
      estimatedFilamentGrams: data.estimatedFilamentGrams ?? null,
      material: data.material ?? null,
      estimatedCost: data.estimatedCost ?? null,
      modelSourceUrl: data.modelSourceUrl ?? null,
      notes: data.notes ?? null,
      isDefault,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(version);

    return version;
  }

  async update(id: string, data: UpdateRecipeVersionData): Promise<RecipeVersion | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = this.items[index]!;

    if (data.isDefault === true) {
      this.clearDefault(current.recipeId, id);
    }

    const updated: RecipeVersion = {
      ...current,
      ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
      updatedAt: new Date(),
    };

    this.items[this.items.findIndex((item) => item.id === id)] = updated;

    return updated;
  }

  async findById(id: string): Promise<RecipeVersion | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async listByRecipe(
    recipeId: string,
    filter: ListRecipeVersionsFilter = {},
  ): Promise<RecipeVersion[]> {
    return this.items
      .filter((item) => item.recipeId === recipeId)
      .filter((item) => (filter.includeArchived ? true : item.archivedAt === null))
      .sort((a, b) => a.version - b.version);
  }

  async archive(id: string): Promise<RecipeVersion | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const archived: RecipeVersion = { ...this.items[index]!, archivedAt: new Date() };
    this.items[index] = archived;

    return archived;
  }

  private clearDefault(recipeId: string, exceptId?: string): void {
    this.items.forEach((item, index) => {
      if (item.recipeId === recipeId && item.isDefault && item.id !== exceptId) {
        this.items[index] = { ...item, isDefault: false };
      }
    });
  }
}
