import { prisma } from '@pegs-ops/database';
import type {
  CreateEventData,
  Event,
  EventRepository,
  ListEventsFilter,
  UpdateEventData,
} from '@pegs-ops/domain';

export class PrismaEventRepository implements EventRepository {
  async create(data: CreateEventData): Promise<Event> {
    return prisma.event.create({
      data: {
        name: data.name,
        eventDate: data.eventDate,
        status: data.status ?? 'PLANNED',
        notes: data.notes ?? null,
      },
    });
  }

  async update(id: string, data: UpdateEventData): Promise<Event | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.event.update({ where: { id }, data });
  }

  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } });
  }

  async list(filter: ListEventsFilter = {}): Promise<Event[]> {
    return prisma.event.findMany({
      where: filter.includeArchived ? {} : { archivedAt: null },
      orderBy: { eventDate: 'asc' },
    });
  }

  async archive(id: string): Promise<Event | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.event.update({ where: { id }, data: { archivedAt: new Date() } });
  }
}
