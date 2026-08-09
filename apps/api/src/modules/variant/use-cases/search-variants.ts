import type { VariantRepository, VariantWithProduct } from '@pegs-ops/domain';

/** Busca aberta de variantes, para telas que não partem do produto. */
export async function searchVariants(
  repository: VariantRepository,
  term: string,
): Promise<VariantWithProduct[]> {
  if (term.trim().length === 0) return [];

  return repository.search(term.trim());
}
