import { prisma } from '@pegs-ops/database';
import type {
  CreateVariantData,
  ListVariantsFilter,
  UpdateVariantData,
  VariantRepository,
  VariantWithAttributes,
} from '@pegs-ops/domain';

/** As leituras sempre trazem os atributos junto da variante. */
const withAttributes = {
  attributes: { orderBy: { name: 'asc' } },
} as const;

/**
 * Implementação do VariantRepository sobre o Prisma.
 * Os métodos que operam por id devolvem null quando o registro não existe;
 * traduzir isso em erro de domínio é responsabilidade dos use cases.
 */
export class PrismaVariantRepository implements VariantRepository {
  async create(productId: string, data: CreateVariantData): Promise<VariantWithAttributes> {
    return prisma.variant.create({
      data: {
        productId,
        sku: data.sku ?? null,
        attributes: { create: data.attributes ?? [] },
      },
      include: withAttributes,
    });
  }

  /**
   * Os atributos não têm endpoint próprio: quando `attributes` vem no payload,
   * a lista enviada substitui a atual por inteiro, dentro da mesma transação.
   */
  async update(id: string, data: UpdateVariantData): Promise<VariantWithAttributes | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.variant.update({
      where: { id },
      data: {
        ...(data.sku !== undefined ? { sku: data.sku } : {}),
        ...(data.attributes !== undefined
          ? { attributes: { deleteMany: {}, create: data.attributes } }
          : {}),
      },
      include: withAttributes,
    });
  }

  async findById(id: string): Promise<VariantWithAttributes | null> {
    return prisma.variant.findUnique({ where: { id }, include: withAttributes });
  }

  async listByProduct(
    productId: string,
    filter: ListVariantsFilter = {},
  ): Promise<VariantWithAttributes[]> {
    return prisma.variant.findMany({
      where: {
        productId,
        ...(filter.includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: { createdAt: 'asc' },
      include: withAttributes,
    });
  }

  async archive(id: string): Promise<VariantWithAttributes | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.variant.update({
      where: { id },
      data: { archivedAt: new Date() },
      include: withAttributes,
    });
  }
}
