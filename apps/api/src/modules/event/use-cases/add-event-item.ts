import {
  EventNotFoundError,
  VariantAlreadyPlannedError,
  VariantNotFoundError,
  type CreateEventItemData,
  type EventItem,
  type EventItemRepository,
  type EventRepository,
  type VariantRepository,
} from '@pegs-ops/domain';

/** O usuário pesquisa e escolhe a Variante; só a Meta é informada. */
export async function addEventItem(
  itemRepository: EventItemRepository,
  eventRepository: EventRepository,
  variantRepository: VariantRepository,
  eventId: string,
  input: CreateEventItemData,
): Promise<EventItem> {
  const event = await eventRepository.findById(eventId);

  if (!event) {
    throw new EventNotFoundError(eventId);
  }

  const variant = await variantRepository.findById(input.variantId);

  if (!variant) {
    throw new VariantNotFoundError(input.variantId);
  }

  const existing = await itemRepository.findByEventAndVariant(eventId, input.variantId);

  if (existing) {
    throw new VariantAlreadyPlannedError(input.variantId);
  }

  return itemRepository.create(eventId, input);
}
