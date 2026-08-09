import {
  EventItemNotFoundError,
  type EventItem,
  type EventItemRepository,
  type UpdateEventItemData,
} from '@pegs-ops/domain';

/** Apenas a Meta pode ser editada; todo o resto é calculado. */
export async function updateEventItem(
  repository: EventItemRepository,
  id: string,
  input: UpdateEventItemData,
): Promise<EventItem> {
  const item = await repository.update(id, input);

  if (!item) {
    throw new EventItemNotFoundError(id);
  }

  return item;
}
