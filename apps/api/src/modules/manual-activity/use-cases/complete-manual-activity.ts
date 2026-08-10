import {
  isActivityCompleted,
  ManualActivityAlreadyCompletedError,
  ManualActivityNotFoundError,
  type ManualActivity,
  type ManualActivityRepository,
} from '@pegs-ops/domain';

/** Concluir registra o momento: é ele que decide o que aparece em "Concluídas Hoje". */
export async function completeManualActivity(
  repository: ManualActivityRepository,
  id: string,
  completedAt: Date = new Date(),
): Promise<ManualActivity> {
  const activity = await repository.findById(id);

  if (!activity) {
    throw new ManualActivityNotFoundError(id);
  }

  if (isActivityCompleted(activity)) {
    throw new ManualActivityAlreadyCompletedError(id);
  }

  const completed = await repository.complete(id, completedAt);

  if (!completed) {
    throw new ManualActivityNotFoundError(id);
  }

  return completed;
}
