import { randomUUID } from 'node:crypto';

import type {
  CreateProductData,
  ListProductsFilter,
  Origin,
  ProductRepository,
  ProductWithOrigin,
  UpdateProductData,
} from '@pegs-ops/domain';

/** Dublê do ProductRepository para testar os use cases sem banco. */
export class InMemoryProductRepository implements ProductRepository {
  readonly items: ProductWithOrigin[] = [];

  constructor(readonly origins: Origin[] = []) {}

  private resolveOrigin(originId: string | null): Origin | null {
    if (!originId) return null;

    return this.origins.find((origin) => origin.id === originId) ?? null;
  }

  async create(data: CreateProductData): Promise<ProductWithOrigin> {
    const now = new Date();
    const originId = data.originId ?? null;
    const product: ProductWithOrigin = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      originId,
      originUrl: data.originUrl ?? null,
      origin: this.resolveOrigin(originId),
      notes: data.notes ?? null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(product);

    return product;
  }

  async update(id: string, data: UpdateProductData): Promise<ProductWithOrigin | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = this.items[index]!;
    const changes = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );
    const updated: ProductWithOrigin = {
      ...current,
      ...changes,
      updatedAt: new Date(),
    };
    updated.origin = this.resolveOrigin(updated.originId);

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<ProductWithOrigin | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async list(filter: ListProductsFilter = {}): Promise<ProductWithOrigin[]> {
    const items = filter.includeArchived
      ? this.items
      : this.items.filter((item) => item.archivedAt === null);

    return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async archive(id: string): Promise<ProductWithOrigin | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const archived: ProductWithOrigin = { ...this.items[index]!, archivedAt: new Date() };
    this.items[index] = archived;

    return archived;
  }

  async existsByName(name: string): Promise<boolean> {
    return this.items.some((item) => item.name.toLowerCase() === name.trim().toLowerCase());
  }
}
