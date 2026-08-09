import type { CreateVariantInput, UpdateVariantInput, VariantDto } from '@pegs-ops/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

export const variantKeys = {
  all: ['variants'] as const,
  list: (productId: string) => ['variants', productId] as const,
};

export function useVariants(productId: string) {
  return useQuery({
    queryKey: variantKeys.list(productId),
    queryFn: () => apiFetch<VariantDto[]>(`/products/${productId}/variants`),
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVariantInput) =>
      apiFetch<VariantDto>(`/products/${productId}/variants`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: variantKeys.list(productId) }),
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVariantInput }) =>
      apiFetch<VariantDto>(`/variants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: variantKeys.list(productId) }),
  });
}

export function useArchiveVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/variants/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: variantKeys.list(productId) }),
  });
}
