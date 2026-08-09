import { EventItemNotFoundError, type EventItem, type EventItemRepository } from '@pegs-ops/domain';

/**
 * Item de planejamento é removido de fato, não arquivado: ele não é um registro
 * do que aconteceu, apenas uma intenção que pode ser desfeita.
 */
export async function removeEventItem(
  repository: EventItemRepository,
  id: string,
): Promise<EventItem> {
  const item = await repository.remove(id);

  if (!item) {
    throw new EventItemNotFoundError(id);
  }

  return item;
}
