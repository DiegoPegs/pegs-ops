import type { Event, EventRepository, ListEventsFilter } from '@pegs-ops/domain';

export async function listEvents(
  repository: EventRepository,
  filter: ListEventsFilter = {},
): Promise<Event[]> {
  return repository.list(filter);
}
