import {
  ManualActivityNotFoundError,
  type ManualActivity,
  type ManualActivityRepository,
  type UpdateManualActivityData,
} from '@pegs-ops/domain';

export async function updateManualActivity(
  repository: ManualActivityRepository,
  id: string,
  input: UpdateManualActivityData,
): Promise<ManualActivity> {
  const activity = await repository.update(id, input);

  if (!activity) {
    throw new ManualActivityNotFoundError(id);
  }

  return activity;
}
