import type { Origin } from './origin.entity.js';

export interface OriginRepository {
  list(): Promise<Origin[]>;
  findById(id: string): Promise<Origin | null>;
}
