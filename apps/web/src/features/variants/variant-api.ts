import type { VariantDto } from '@pegs-ops/shared';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

/** A Variante é navegável: a tela dedicada carrega uma variante por id. */
export function useVariant(id: string) {
  return useQuery({
    queryKey: ['variant', id] as const,
    queryFn: () => apiFetch<VariantDto>(`/variants/${id}`),
  });
}
