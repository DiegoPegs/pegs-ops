import { prisma } from '@pegs-ops/database';
import type {
  CreateProductData,
  ListProductsFilter,
  ProductRepository,
  ProductWithOrigin,
  UpdateProductData,
} from '@pegs-ops/domain';

/** As leituras sempre resolvem a origem junto do produto. */
const withOrigin = { origin: { select: { id: true, name: true } } } as const;

/**
 * Implementação do ProductRepository sobre o Prisma.
 * Os métodos que operam por id devolvem null quando o registro não existe;
 * traduzir isso em erro de domínio é responsabilidade dos use cases.
 */
export class PrismaProductRepository implements ProductRepository {
  async create(data: CreateProductData): Promise<ProductWithOrigin> {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        originId: data.originId ?? null,
        originUrl: data.originUrl ?? null,
        notes: data.notes ?? null,
      },
      include: withOrigin,
    });
  }

  async update(id: string, data: UpdateProductData): Promise<ProductWithOrigin | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.product.update({ where: { id }, data, include: withOrigin });
  }

  async findById(id: string): Promise<ProductWithOrigin | null> {
    return prisma.product.findUnique({ where: { id }, include: withOrigin });
  }

  async list(filter: ListProductsFilter = {}): Promise<ProductWithOrigin[]> {
    return prisma.product.findMany({
      where: filter.includeArchived ? {} : { archivedAt: null },
      orderBy: { createdAt: 'desc' },
      include: withOrigin,
    });
  }

  async archive(id: string): Promise<ProductWithOrigin | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.product.update({
      where: { id },
      data: { archivedAt: new Date() },
      include: withOrigin,
    });
  }

  /** Disponível para a futura regra de nome único; ainda não usado na criação. */
  async existsByName(name: string): Promise<boolean> {
    const found = await prisma.product.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });

    return found !== null;
  }
}
