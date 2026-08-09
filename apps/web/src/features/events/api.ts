import type {
  CreateEventInput,
  CreateEventItemInput,
  EventDto,
  EventPlanningDto,
  UpdateEventInput,
  UpdateEventItemInput,
} from '@pegs-ops/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';

export const eventKeys = {
  all: ['events'] as const,
  detail: (id: string) => ['events', id] as const,
  planning: (id: string) => ['events', id, 'planning'] as const,
};

export function useEvents(includeArchived: boolean) {
  return useQuery({
    queryKey: [...eventKeys.all, { includeArchived }] as const,
    queryFn: () => apiFetch<EventDto[]>(`/events${includeArchived ? '?includeArchived=true' : ''}`),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => apiFetch<EventDto>(`/events/${id}`),
  });
}

/** Visão calculada: nada aqui vem de coluna persistida. */
export function useEventPlanning(id: string) {
  return useQuery({
    queryKey: eventKeys.planning(id),
    queryFn: () => apiFetch<EventPlanningDto>(`/events/${id}/planning`),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      apiFetch<EventDto>('/events', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEventInput) =>
      apiFetch<EventDto>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useArchiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/events/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useAddEventItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventItemInput) =>
      apiFetch(`/events/${eventId}/items`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.planning(eventId) }),
  });
}

export function useUpdateEventItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventItemInput }) =>
      apiFetch(`/event-items/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.planning(eventId) }),
  });
}

export function useRemoveEventItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/event-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.planning(eventId) }),
  });
}
