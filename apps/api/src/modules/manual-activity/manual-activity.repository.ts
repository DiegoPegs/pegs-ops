import { prisma } from '@pegs-ops/database';
import type {
  CreateManualActivityData,
  ListManualActivitiesFilter,
  ManualActivity,
  ManualActivityRepository,
  UpdateManualActivityData,
} from '@pegs-ops/domain';

export class PrismaManualActivityRepository implements ManualActivityRepository {
  async create(data: CreateManualActivityData): Promise<ManualActivity> {
    return prisma.manualActivity.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? 'MEDIUM',
        dueDate: data.dueDate ?? null,
      },
    });
  }

  async update(id: string, data: UpdateManualActivityData): Promise<ManualActivity | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.manualActivity.update({ where: { id }, data });
  }

  async findById(id: string): Promise<ManualActivity | null> {
    return prisma.manualActivity.findUnique({ where: { id } });
  }

  async list(filter: ListManualActivitiesFilter = {}): Promise<ManualActivity[]> {
    return prisma.manualActivity.findMany({
      where: filter.includeArchived ? {} : { archivedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async archive(id: string): Promise<ManualActivity | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.manualActivity.update({ where: { id }, data: { archivedAt: new Date() } });
  }

  async complete(id: string, completedAt: Date): Promise<ManualActivity | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.manualActivity.update({ where: { id }, data: { completedAt } });
  }

  async reopen(id: string): Promise<ManualActivity | null> {
    const exists = await this.findById(id);
    if (!exists) return null;

    return prisma.manualActivity.update({ where: { id }, data: { completedAt: null } });
  }
}
