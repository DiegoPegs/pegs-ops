import { randomUUID } from 'node:crypto';

import type {
  CreateProductData,
  ListProductsFilter,
  Product,
  ProductRepository,
  UpdateProductData,
} from '@pegs-ops/domain';

/** Dublê do ProductRepository para testar os use cases sem banco. */
export class InMemoryProductRepository implements ProductRepository {
  readonly items: Product[] = [];

  async create(data: CreateProductData): Promise<Product> {
    const now = new Date();
    const product: Product = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      sourceType: data.sourceType ?? null,
      sourceUrl: data.sourceUrl ?? null,
      notes: data.notes ?? null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(product);

    return product;
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = this.items[index]!;
    const updated: Product = {
      ...current,
      ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
      updatedAt: new Date(),
    };

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async list(filter: ListProductsFilter = {}): Promise<Product[]> {
    const items = filter.includeArchived
      ? this.items
      : this.items.filter((item) => item.archivedAt === null);

    return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async archive(id: string): Promise<Product | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const archived: Product = { ...this.items[index]!, archivedAt: new Date() };
    this.items[index] = archived;

    return archived;
  }
}
