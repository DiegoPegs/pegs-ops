import { prisma } from '@pegs-ops/database';
import type {
  CreateEventItemData,
  EventItem,
  EventItemRepository,
  UpdateEventItemData,
} from '@pegs-ops/domain';

export class PrismaEventItemRepository implements EventItemRepository {
  async create(eventId: string, data: CreateEventItemData): Promise<EventItem> {
    return prisma.eventItem.create({
      data: {
        eventId,
        variantId: data.variantId,
        targetQuantity: data.targetQuantity,
      },
    });
  }

  async update(id: string, data: UpdateEventItemData): Promise<EventItem | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.eventItem.update({ where: { id }, data });
  }

  async findById(id: string): Promise<EventItem | null> {
    return prisma.eventItem.findUnique({ where: { id } });
  }

  async findByEventAndVariant(eventId: string, variantId: string): Promise<EventItem | null> {
    return prisma.eventItem.findUnique({ where: { eventId_variantId: { eventId, variantId } } });
  }

  async listByEvent(eventId: string): Promise<EventItem[]> {
    return prisma.eventItem.findMany({ where: { eventId }, orderBy: { id: 'asc' } });
  }

  async remove(id: string): Promise<EventItem | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.eventItem.delete({ where: { id } });
  }
}
