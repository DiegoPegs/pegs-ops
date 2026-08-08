import type { CreateProductData, ProductWithOrigin, UpdateProductData } from './product.entity.js';

export interface ListProductsFilter {
  /** Quando true, inclui também os produtos arquivados. Padrão: false. */
  includeArchived?: boolean;
}

/**
 * Porta de persistência do Product.
 * A implementação concreta (Prisma) vive na camada de infraestrutura da API.
 */
export interface ProductRepository {
  create(data: CreateProductData): Promise<ProductWithOrigin>;
  update(id: string, data: UpdateProductData): Promise<ProductWithOrigin | null>;
  findById(id: string): Promise<ProductWithOrigin | null>;
  list(filter?: ListProductsFilter): Promise<ProductWithOrigin[]>;
  archive(id: string): Promise<ProductWithOrigin | null>;
  /**
   * Disponível para a futura regra de nome único.
   * Ainda não é usado pelo caso de uso de criação.
   */
  existsByName(name: string): Promise<boolean>;
}
