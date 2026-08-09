import { prisma } from '@pegs-ops/database';
import type {
  CreateRecipeData,
  ListRecipesFilter,
  Recipe,
  RecipeRepository,
  UpdateRecipeData,
} from '@pegs-ops/domain';

/**
 * Implementação do RecipeRepository sobre o Prisma.
 * Os métodos que operam por id devolvem null quando o registro não existe;
 * traduzir isso em erro de domínio é responsabilidade dos use cases.
 */
export class PrismaRecipeRepository implements RecipeRepository {
  async create(variantId: string, data: CreateRecipeData): Promise<Recipe> {
    return prisma.recipe.create({
      data: {
        variantId,
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

  async update(id: string, data: UpdateRecipeData): Promise<Recipe | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.recipe.update({ where: { id }, data });
  }

  async findById(id: string): Promise<Recipe | null> {
    return prisma.recipe.findUnique({ where: { id } });
  }

  async listByVariant(variantId: string, filter: ListRecipesFilter = {}): Promise<Recipe[]> {
    return prisma.recipe.findMany({
      where: {
        variantId,
        ...(filter.includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async archive(id: string): Promise<Recipe | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.recipe.update({ where: { id }, data: { archivedAt: new Date() } });
  }
}
