import {
  isActivityCompleted,
  ManualActivityNotCompletedError,
  ManualActivityNotFoundError,
  type ManualActivity,
  type ManualActivityRepository,
} from '@pegs-ops/domain';

export async function reopenManualActivity(
  repository: ManualActivityRepository,
  id: string,
): Promise<ManualActivity> {
  const activity = await repository.findById(id);

  if (!activity) {
    throw new ManualActivityNotFoundError(id);
  }

  if (!isActivityCompleted(activity)) {
    throw new ManualActivityNotCompletedError(id);
  }

  const reopened = await repository.reopen(id);

  if (!reopened) {
    throw new ManualActivityNotFoundError(id);
  }

  return reopened;
}
