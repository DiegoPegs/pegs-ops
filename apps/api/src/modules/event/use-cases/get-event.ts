import { EventNotFoundError, type Event, type EventRepository } from '@pegs-ops/domain';

export async function getEvent(repository: EventRepository, id: string): Promise<Event> {
  const event = await repository.findById(id);

  if (!event) {
    throw new EventNotFoundError(id);
  }

  return event;
}
