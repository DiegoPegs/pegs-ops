import type { CreateProductData, Product, UpdateProductData } from './product.entity.js';

export interface ListProductsFilter {
  /** Quando true, inclui também os produtos arquivados. Padrão: false. */
  includeArchived?: boolean;
}

/**
 * Porta de persistência do Product.
 * A implementação concreta (Prisma) vive na camada de infraestrutura da API.
 */
export interface ProductRepository {
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  list(filter?: ListProductsFilter): Promise<Product[]>;
  archive(id: string): Promise<Product | null>;
}
