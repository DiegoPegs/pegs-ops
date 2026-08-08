/**
 * Produto: item que o negócio fabrica ou revende.
 *
 * Nesta etapa o Product não possui variantes, receitas, estoque, categorias
 * nem tags — esses conceitos serão modelados posteriormente.
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  sourceType: string | null;
  sourceUrl: string | null;
  notes: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Campos aceitos na criação de um produto. */
export interface CreateProductData {
  name: string;
  description?: string | null;
  sourceType?: string | null;
  sourceUrl?: string | null;
  notes?: string | null;
}

/** Campos aceitos na atualização de um produto. Todos opcionais. */
export type UpdateProductData = Partial<CreateProductData>;

/** Um produto arquivado saiu da operação, mas continua no histórico. */
export function isArchived(product: Product): boolean {
  return product.archivedAt !== null;
}
