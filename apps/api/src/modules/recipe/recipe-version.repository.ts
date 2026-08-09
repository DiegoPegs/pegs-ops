import { prisma } from '@pegs-ops/database';
import type {
  CreateRecipeVersionData,
  ListRecipeVersionsFilter,
  RecipeVersion,
  RecipeVersionRepository,
  RecipeVersionWithRecipe,
  UpdateRecipeVersionData,
} from '@pegs-ops/domain';

/** O Decimal do Prisma não vaza do repositório: o domínio trabalha com number. */
interface Decimalish {
  toNumber(): number;
}

type RecipeVersionRow = Omit<RecipeVersion, 'estimatedFilamentGrams' | 'estimatedCost'> & {
  estimatedFilamentGrams: Decimalish | null;
  estimatedCost: Decimalish | null;
};

function toDomain(row: RecipeVersionRow): RecipeVersion {
  return {
    ...row,
    estimatedFilamentGrams: row.estimatedFilamentGrams?.toNumber() ?? null,
    estimatedCost: row.estimatedCost?.toNumber() ?? null,
  };
}

export class PrismaRecipeVersionRepository implements RecipeVersionRepository {
  /**
   * O número da versão é sequencial por receita e nunca é reaproveitado:
   * usamos o maior número já existente, incluindo versões arquivadas.
   * Numeração e troca de padrão acontecem na mesma transação.
   */
  async create(recipeId: string, data: CreateRecipeVersionData): Promise<RecipeVersion> {
    const created = await prisma.$transaction(async (tx) => {
      const last = await tx.recipeVersion.findFirst({
        where: { recipeId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const isFirstVersion = last === null;
      // A primeira versão de uma receita nasce como padrão.
      const isDefault = data.isDefault === true || isFirstVersion;

      if (isDefault) {
        await tx.recipeVersion.updateMany({
          where: { recipeId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.recipeVersion.create({
        data: {
          recipeId,
          version: (last?.version ?? 0) + 1,
          printerName: data.printerName ?? null,
          estimatedPrintTimeMinutes: data.estimatedPrintTimeMinutes ?? null,
          estimatedFilamentGrams: data.estimatedFilamentGrams ?? null,
          material: data.material ?? null,
          estimatedCost: data.estimatedCost ?? null,
          modelSourceUrl: data.modelSourceUrl ?? null,
          notes: data.notes ?? null,
          isDefault,
        },
      });
    });

    return toDomain(created);
  }

  async update(id: string, data: UpdateRecipeVersionData): Promise<RecipeVersion | null> {
    const current = await prisma.recipeVersion.findUnique({ where: { id } });
    if (!current) return null;

    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.recipeVersion.updateMany({
          where: { recipeId: current.recipeId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.recipeVersion.update({ where: { id }, data });
    });

    return toDomain(updated);
  }

  async findById(id: string): Promise<RecipeVersion | null> {
    const row = await prisma.recipeVersion.findUnique({ where: { id } });

    return row ? toDomain(row) : null;
  }

  async listByRecipe(
    recipeId: string,
    filter: ListRecipeVersionsFilter = {},
  ): Promise<RecipeVersion[]> {
    const rows = await prisma.recipeVersion.findMany({
      where: {
        recipeId,
        ...(filter.includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: { version: 'asc' },
    });

    return rows.map(toDomain);
  }

  /**
   * Configuração de fabricação vigente da Variante: a versão padrão da receita
   * ativa mais antiga. Quem consome — Eventos hoje, Produção adiante — não
   * escolhe receita; a regra vive aqui.
   */
  async findCurrentByVariant(variantId: string): Promise<RecipeVersionWithRecipe | null> {
    const row = await prisma.recipeVersion.findFirst({
      where: {
        isDefault: true,
        archivedAt: null,
        recipe: { variantId, archivedAt: null },
      },
      orderBy: { recipe: { createdAt: 'asc' } },
      include: { recipe: { select: { id: true, name: true } } },
    });

    return row ? { ...toDomain(row), recipe: row.recipe } : null;
  }

  async archive(id: string): Promise<RecipeVersion | null> {
    const exists = await prisma.recipeVersion.findUnique({ where: { id } });
    if (!exists) return null;

    const archived = await prisma.recipeVersion.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    return toDomain(archived);
  }
}
