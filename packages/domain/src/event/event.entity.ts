/**
 * Estado do evento. A mudança é manual nesta etapa: encerramento e transições
 * automáticas virão com o módulo de Eventos completo.
 */
export type EventStatus = 'PLANNED' | 'DONE' | 'CANCELLED';

/** Evento: uma feira, exposição ou entrega para a qual se planeja produção. */
export interface Event {
  id: string;
  name: string;
  eventDate: Date;
  status: EventStatus;
  notes: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item planejado do evento.
 *
 * Guarda apenas a Meta: estoque, produção necessária, tempo, filamento e custo
 * são sempre calculados em tempo real (D-014).
 */
export interface EventItem {
  id: string;
  eventId: string;
  variantId: string;
  targetQuantity: number;
}

export interface CreateEventData {
  name: string;
  eventDate: Date;
  status?: EventStatus;
  notes?: string | null;
}

export type UpdateEventData = Partial<CreateEventData>;

export interface CreateEventItemData {
  variantId: string;
  targetQuantity: number;
}

export interface UpdateEventItemData {
  targetQuantity: number;
}
