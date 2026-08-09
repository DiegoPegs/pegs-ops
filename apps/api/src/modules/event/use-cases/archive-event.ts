import {
  EventAlreadyArchivedError,
  EventNotFoundError,
  type Event,
  type EventRepository,
} from '@pegs-ops/domain';

/** Arquivamento é lógico: o evento sai da operação, mas permanece no histórico. */
export async function archiveEvent(repository: EventRepository, id: string): Promise<Event> {
  const event = await repository.findById(id);

  if (!event) {
    throw new EventNotFoundError(id);
  }

  if (event.archivedAt !== null) {
    throw new EventAlreadyArchivedError(id);
  }

  const archived = await repository.archive(id);

  if (!archived) {
    throw new EventNotFoundError(id);
  }

  return archived;
}
