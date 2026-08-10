import type {
  CreateManualActivityInput,
  ManualActivityDto,
  UpdateManualActivityInput,
} from '@pegs-ops/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

/**
 * A Central já traz as atividades no /work-center; aqui ficam apenas as
 * mutações. Toda alteração invalida a Central, que reagrupa as listas.
 */
function useActivityMutation<TInput>(mutationFn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['work-center'] }),
  });
}

export function useCreateActivity() {
  return useActivityMutation((input: CreateManualActivityInput) =>
    apiFetch<ManualActivityDto>('/manual-activities', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}

export function useUpdateActivity() {
  return useActivityMutation(({ id, input }: { id: string; input: UpdateManualActivityInput }) =>
    apiFetch<ManualActivityDto>(`/manual-activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  );
}

export function useCompleteActivity() {
  return useActivityMutation((id: string) =>
    apiFetch<ManualActivityDto>(`/manual-activities/${id}/complete`, { method: 'POST' }),
  );
}

export function useReopenActivity() {
  return useActivityMutation((id: string) =>
    apiFetch<ManualActivityDto>(`/manual-activities/${id}/reopen`, { method: 'POST' }),
  );
}

export function useArchiveActivity() {
  return useActivityMutation((id: string) =>
    apiFetch<void>(`/manual-activities/${id}`, { method: 'DELETE' }),
  );
}
