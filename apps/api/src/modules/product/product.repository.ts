import { prisma } from '@pegs-ops/database';
import type {
  CreateProductData,
  ListProductsFilter,
  Product,
  ProductRepository,
  UpdateProductData,
} from '@pegs-ops/domain';

/**
 * Implementação do ProductRepository sobre o Prisma.
 * Os métodos que operam por id devolvem null quando o registro não existe;
 * traduzir isso em erro de domínio é responsabilidade dos use cases.
 */
export class PrismaProductRepository implements ProductRepository {
  async create(data: CreateProductData): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        sourceType: data.sourceType ?? null,
        sourceUrl: data.sourceUrl ?? null,
        notes: data.notes ?? null,
      },
    });
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.product.update({ where: { id }, data });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async list(filter: ListProductsFilter = {}): Promise<Product[]> {
    return prisma.product.findMany({
      where: filter.includeArchived ? {} : { archivedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async archive(id: string): Promise<Product | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.product.update({ where: { id }, data: { archivedAt: new Date() } });
  }
}
