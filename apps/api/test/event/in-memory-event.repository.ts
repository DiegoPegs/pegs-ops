import { randomUUID } from 'node:crypto';

import type {
  CreateEventData,
  CreateEventItemData,
  Event,
  EventItem,
  EventItemRepository,
  EventRepository,
  ListEventsFilter,
  UpdateEventData,
  UpdateEventItemData,
} from '@pegs-ops/domain';

export class InMemoryEventRepository implements EventRepository {
  readonly items: Event[] = [];

  async create(data: CreateEventData): Promise<Event> {
    const now = new Date();
    const event: Event = {
      id: randomUUID(),
      name: data.name,
      eventDate: data.eventDate,
      status: data.status ?? 'PLANNED',
      notes: data.notes ?? null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(event);

    return event;
  }

  async update(id: string, data: UpdateEventData): Promise<Event | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated: Event = {
      ...this.items[index]!,
      ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
      updatedAt: new Date(),
    };

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<Event | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async list(filter: ListEventsFilter = {}): Promise<Event[]> {
    return this.items
      .filter((item) => (filter.includeArchived ? true : item.archivedAt === null))
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  }

  async archive(id: string): Promise<Event | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const archived: Event = { ...this.items[index]!, archivedAt: new Date() };
    this.items[index] = archived;

    return archived;
  }
}

export class InMemoryEventItemRepository implements EventItemRepository {
  readonly items: EventItem[] = [];

  async create(eventId: string, data: CreateEventItemData): Promise<EventItem> {
    const item: EventItem = {
      id: randomUUID(),
      eventId,
      variantId: data.variantId,
      targetQuantity: data.targetQuantity,
    };

    this.items.push(item);

    return item;
  }

  async update(id: string, data: UpdateEventItemData): Promise<EventItem | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated: EventItem = { ...this.items[index]!, ...data };
    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<EventItem | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByEventAndVariant(eventId: string, variantId: string): Promise<EventItem | null> {
    return (
      this.items.find((item) => item.eventId === eventId && item.variantId === variantId) ?? null
    );
  }

  async listByEvent(eventId: string): Promise<EventItem[]> {
    return this.items.filter((item) => item.eventId === eventId);
  }

  async remove(id: string): Promise<EventItem | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const [removed] = this.items.splice(index, 1);

    return removed ?? null;
  }
}
