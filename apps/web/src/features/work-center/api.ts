import type { WorkCenterDto } from '@pegs-ops/shared';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

/** A Central é somente leitura: só há consulta aqui. */
export function useWorkCenter() {
  return useQuery({
    queryKey: ['work-center'] as const,
    queryFn: () => apiFetch<WorkCenterDto>('/work-center'),
  });
}
