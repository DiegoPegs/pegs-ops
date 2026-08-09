/**
 * Atributo livre de uma variante (Modelo = Gato, Cor = Branco).
 *
 * O par name/value é intencionalmente aberto: definições e opções fechadas
 * (AttributeDefinition / AttributeOption) só existirão com o módulo de
 * Administração.
 */
export interface VariantAttribute {
  id: string;
  variantId: string;
  name: string;
  value: string;
}

/**
 * Variante: o que de fato é produzido a partir de um Produto.
 *
 * Nesta etapa a Variante não possui receitas, estoque, fotos, arquivos
 * nem preços — esses módulos virão depois e se apoiarão nela.
 */
export interface Variant {
  id: string;
  productId: string;
  sku: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Variante com seus atributos resolvidos, como trafega nas leituras. */
export interface VariantWithAttributes extends Variant {
  attributes: VariantAttribute[];
}

/** Variante com o produto a que pertence, para busca e listagens transversais. */
export interface VariantWithProduct extends VariantWithAttributes {
  product: { id: string; name: string };
}

/** Atributo como chega nos comandos de escrita, antes de ter id. */
export interface VariantAttributeData {
  name: string;
  value: string;
}

export interface CreateVariantData {
  sku?: string | null;
  attributes?: VariantAttributeData[];
}

export type UpdateVariantData = Partial<CreateVariantData>;

/** Uma variante arquivada sai da operação, mas continua no histórico. */
export function isVariantArchived(variant: Variant): boolean {
  return variant.archivedAt !== null;
}
