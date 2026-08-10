import {
  isActivityArchived,
  ManualActivityAlreadyArchivedError,
  ManualActivityNotFoundError,
  type ManualActivity,
  type ManualActivityRepository,
} from '@pegs-ops/domain';

/** Arquivamento é lógico: a atividade sai da Central, mas continua no histórico. */
export async function archiveManualActivity(
  repository: ManualActivityRepository,
  id: string,
): Promise<ManualActivity> {
  const activity = await repository.findById(id);

  if (!activity) {
    throw new ManualActivityNotFoundError(id);
  }

  if (isActivityArchived(activity)) {
    throw new ManualActivityAlreadyArchivedError(id);
  }

  const archived = await repository.archive(id);

  if (!archived) {
    throw new ManualActivityNotFoundError(id);
  }

  return archived;
}
