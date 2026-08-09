import type { ManualActivityDto, WorkCenterDto } from '@pegs-ops/shared';
import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

/** A Central é somente leitura: só há consulta aqui. */
export function useWorkCenter() {
  return useQuery({
    queryKey: ['work-center'] as const,
    queryFn: () => apiFetch<WorkCenterDto>('/work-center'),
  });
}

/**
 * Atividades manuais ainda não têm persistência: a WO seguinte cria o módulo.
 * A lista fica vazia de propósito, com a estrutura pronta para recebê-las.
 */
export function useManualActivities(): { data: ManualActivityDto[] } {
  return { data: [] };
}
