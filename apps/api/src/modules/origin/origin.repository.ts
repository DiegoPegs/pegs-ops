import { prisma } from '@pegs-ops/database';
import type { Origin, OriginRepository } from '@pegs-ops/domain';

export class PrismaOriginRepository implements OriginRepository {
  async list(): Promise<Origin[]> {
    return prisma.origin.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<Origin | null> {
    return prisma.origin.findUnique({ where: { id } });
  }
}
