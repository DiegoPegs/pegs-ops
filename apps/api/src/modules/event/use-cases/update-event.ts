import {
  EventNotFoundError,
  type Event,
  type EventRepository,
  type UpdateEventData,
} from '@pegs-ops/domain';

export async function updateEvent(
  repository: EventRepository,
  id: string,
  input: UpdateEventData,
): Promise<Event> {
  const event = await repository.update(id, input);

  if (!event) {
    throw new EventNotFoundError(id);
  }

  return event;
}
