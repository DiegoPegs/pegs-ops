import { randomUUID } from 'node:crypto';

import type {
  CreateManualActivityData,
  ListManualActivitiesFilter,
  ManualActivity,
  ManualActivityRepository,
  UpdateManualActivityData,
} from '@pegs-ops/domain';

export class InMemoryManualActivityRepository implements ManualActivityRepository {
  readonly items: ManualActivity[] = [];

  async create(data: CreateManualActivityData): Promise<ManualActivity> {
    const now = new Date();
    const activity: ManualActivity = {
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate ?? null,
      completedAt: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(activity);

    return activity;
  }

  async update(id: string, data: UpdateManualActivityData): Promise<ManualActivity | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated: ManualActivity = {
      ...this.items[index]!,
      ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
      updatedAt: new Date(),
    };

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<ManualActivity | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async list(filter: ListManualActivitiesFilter = {}): Promise<ManualActivity[]> {
    return this.items.filter((item) => (filter.includeArchived ? true : item.archivedAt === null));
  }

  async archive(id: string): Promise<ManualActivity | null> {
    return this.patch(id, { archivedAt: new Date() });
  }

  async complete(id: string, completedAt: Date): Promise<ManualActivity | null> {
    return this.patch(id, { completedAt });
  }

  async reopen(id: string): Promise<ManualActivity | null> {
    return this.patch(id, { completedAt: null });
  }

  private patch(id: string, changes: Partial<ManualActivity>): ManualActivity | null {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated: ManualActivity = { ...this.items[index]!, ...changes, updatedAt: new Date() };
    this.items[index] = updated;

    return updated;
  }
}
