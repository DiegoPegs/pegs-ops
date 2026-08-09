import type {
  CreateEventData,
  CreateEventItemData,
  Event,
  EventItem,
  UpdateEventData,
  UpdateEventItemData,
} from './event.entity.js';

export interface ListEventsFilter {
  /** Quando true, inclui também os eventos arquivados. Padrão: false. */
  includeArchived?: boolean;
}

export interface EventRepository {
  create(data: CreateEventData): Promise<Event>;
  update(id: string, data: UpdateEventData): Promise<Event | null>;
  findById(id: string): Promise<Event | null>;
  list(filter?: ListEventsFilter): Promise<Event[]>;
  archive(id: string): Promise<Event | null>;
}

export interface EventItemRepository {
  create(eventId: string, data: CreateEventItemData): Promise<EventItem>;
  update(id: string, data: UpdateEventItemData): Promise<EventItem | null>;
  findById(id: string): Promise<EventItem | null>;
  findByEventAndVariant(eventId: string, variantId: string): Promise<EventItem | null>;
  listByEvent(eventId: string): Promise<EventItem[]>;
  /** Item de planejamento é removido de fato: não há histórico a preservar. */
  remove(id: string): Promise<EventItem | null>;
}
