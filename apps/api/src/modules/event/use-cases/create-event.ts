import type { CreateEventData, Event, EventRepository } from '@pegs-ops/domain';

export async function createEvent(
  repository: EventRepository,
  input: CreateEventData,
): Promise<Event> {
  return repository.create(input);
}
