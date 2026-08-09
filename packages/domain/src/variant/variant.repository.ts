import type {
  CreateVariantData,
  UpdateVariantData,
  VariantWithAttributes,
} from './variant.entity.js';

export interface ListVariantsFilter {
  /** Quando true, inclui também as variantes arquivadas. Padrão: false. */
  includeArchived?: boolean;
}

/**
 * Porta de persistência da Variant.
 * A implementação concreta (Prisma) vive na camada de infraestrutura da API.
 */
export interface VariantRepository {
  create(productId: string, data: CreateVariantData): Promise<VariantWithAttributes>;
  update(id: string, data: UpdateVariantData): Promise<VariantWithAttributes | null>;
  findById(id: string): Promise<VariantWithAttributes | null>;
  listByProduct(productId: string, filter?: ListVariantsFilter): Promise<VariantWithAttributes[]>;
  archive(id: string): Promise<VariantWithAttributes | null>;
}
