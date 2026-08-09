import { randomUUID } from 'node:crypto';

import type {
  CreateVariantData,
  ListVariantsFilter,
  UpdateVariantData,
  VariantRepository,
  VariantWithAttributes,
} from '@pegs-ops/domain';

/** Dublê do VariantRepository para testar os use cases sem banco. */
export class InMemoryVariantRepository implements VariantRepository {
  readonly items: VariantWithAttributes[] = [];

  async create(productId: string, data: CreateVariantData): Promise<VariantWithAttributes> {
    const now = new Date();
    const id = randomUUID();
    const variant: VariantWithAttributes = {
      id,
      productId,
      sku: data.sku ?? null,
      attributes: (data.attributes ?? []).map((attribute) => ({
        id: randomUUID(),
        variantId: id,
        name: attribute.name,
        value: attribute.value,
      })),
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(variant);

    return variant;
  }

  async update(id: string, data: UpdateVariantData): Promise<VariantWithAttributes | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = this.items[index]!;
    const updated: VariantWithAttributes = {
      ...current,
      ...(data.sku !== undefined ? { sku: data.sku } : {}),
      // Enviar attributes substitui a lista inteira, como no Prisma.
      ...(data.attributes !== undefined
        ? {
            attributes: data.attributes.map((attribute) => ({
              id: randomUUID(),
              variantId: id,
              name: attribute.name,
              value: attribute.value,
            })),
          }
        : {}),
      updatedAt: new Date(),
    };

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<VariantWithAttributes | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async listByProduct(
    productId: string,
    filter: ListVariantsFilter = {},
  ): Promise<VariantWithAttributes[]> {
    return this.items
      .filter((item) => item.productId === productId)
      .filter((item) => (filter.includeArchived ? true : item.archivedAt === null))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async archive(id: string): Promise<VariantWithAttributes | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const archived: VariantWithAttributes = { ...this.items[index]!, archivedAt: new Date() };
    this.items[index] = archived;

    return archived;
  }
}
