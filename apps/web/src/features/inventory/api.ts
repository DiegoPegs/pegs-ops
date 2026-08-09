import type {
  CreateStockMovementInput,
  StockBalanceDto,
  StockMovementDto,
  StockMovementTypeDto,
} from '@pegs-ops/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

export const inventoryKeys = {
  types: ['stock-movement-types'] as const,
  stock: (variantId: string) => ['stock', variantId] as const,
  movements: (variantId: string) => ['stock-movements', variantId] as const,
};

export function useStockMovementTypes() {
  return useQuery({
    queryKey: inventoryKeys.types,
    queryFn: () => apiFetch<StockMovementTypeDto[]>('/stock-movement-types'),
    staleTime: 5 * 60_000,
  });
}

export function useStock(variantId: string) {
  return useQuery({
    queryKey: inventoryKeys.stock(variantId),
    queryFn: () => apiFetch<StockBalanceDto>(`/variants/${variantId}/stock`),
  });
}

export function useStockMovements(variantId: string) {
  return useQuery({
    queryKey: inventoryKeys.movements(variantId),
    queryFn: () => apiFetch<StockMovementDto[]>(`/variants/${variantId}/stock-movements`),
  });
}

export function useCreateStockMovement(variantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStockMovementInput) =>
      apiFetch<StockMovementDto>('/stock-movements', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    // O saldo é derivado: recarregamos saldo e histórico juntos.
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.stock(variantId) }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.movements(variantId) }),
      ]);
    },
  });
}
