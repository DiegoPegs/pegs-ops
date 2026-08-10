import type {
  CreateManualActivityData,
  ManualActivity,
  UpdateManualActivityData,
} from './manual-activity.entity.js';

export interface ListManualActivitiesFilter {
  /** Quando true, inclui também as arquivadas. Padrão: false. */
  includeArchived?: boolean;
}

export interface ManualActivityRepository {
  create(data: CreateManualActivityData): Promise<ManualActivity>;
  update(id: string, data: UpdateManualActivityData): Promise<ManualActivity | null>;
  findById(id: string): Promise<ManualActivity | null>;
  list(filter?: ListManualActivitiesFilter): Promise<ManualActivity[]>;
  archive(id: string): Promise<ManualActivity | null>;
  complete(id: string, completedAt: Date): Promise<ManualActivity | null>;
  reopen(id: string): Promise<ManualActivity | null>;
}
