import type { CreateProductInput, ProductDto, UpdateProductInput } from '@pegs-ops/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

export const productKeys = {
  all: ['products'] as const,
  list: (includeArchived: boolean) => ['products', { includeArchived }] as const,
  detail: (id: string) => ['products', id] as const,
};

export function useProducts(includeArchived: boolean) {
  return useQuery({
    queryKey: productKeys.list(includeArchived),
    queryFn: () =>
      apiFetch<ProductDto[]>(`/products${includeArchived ? '?includeArchived=true' : ''}`),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiFetch<ProductDto>(`/products/${id}`),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) =>
      apiFetch<ProductDto>('/products', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProductInput) =>
      apiFetch<ProductDto>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
