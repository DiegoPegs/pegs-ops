import type { Origin, OriginRepository } from '@pegs-ops/domain';

export async function listOrigins(repository: OriginRepository): Promise<Origin[]> {
  return repository.list();
}
