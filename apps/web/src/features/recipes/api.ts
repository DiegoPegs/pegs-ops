import type {
  CreateRecipeInput,
  CreateRecipeVersionInput,
  RecipeDto,
  RecipeVersionDto,
  UpdateRecipeInput,
  UpdateRecipeVersionInput,
} from '@pegs-ops/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

export const recipeKeys = {
  list: (variantId: string) => ['recipes', variantId] as const,
  versions: (recipeId: string) => ['recipe-versions', recipeId] as const,
};

export function useRecipes(variantId: string) {
  return useQuery({
    queryKey: recipeKeys.list(variantId),
    queryFn: () => apiFetch<RecipeDto[]>(`/variants/${variantId}/recipes`),
  });
}

export function useCreateRecipe(variantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecipeInput) =>
      apiFetch<RecipeDto>(`/variants/${variantId}/recipes`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.list(variantId) }),
  });
}

export function useUpdateRecipe(variantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRecipeInput }) =>
      apiFetch<RecipeDto>(`/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.list(variantId) }),
  });
}

export function useArchiveRecipe(variantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/recipes/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.list(variantId) }),
  });
}

export function useRecipeVersions(recipeId: string) {
  return useQuery({
    queryKey: recipeKeys.versions(recipeId),
    queryFn: () => apiFetch<RecipeVersionDto[]>(`/recipes/${recipeId}/versions`),
  });
}

export function useCreateRecipeVersion(recipeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecipeVersionInput) =>
      apiFetch<RecipeVersionDto>(`/recipes/${recipeId}/versions`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.versions(recipeId) }),
  });
}

export function useUpdateRecipeVersion(recipeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRecipeVersionInput }) =>
      apiFetch<RecipeVersionDto>(`/recipe-versions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.versions(recipeId) }),
  });
}

export function useArchiveRecipeVersion(recipeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/recipe-versions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.versions(recipeId) }),
  });
}
