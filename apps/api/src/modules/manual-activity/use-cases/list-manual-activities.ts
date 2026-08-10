import type {
  ListManualActivitiesFilter,
  ManualActivity,
  ManualActivityRepository,
} from '@pegs-ops/domain';

export async function listManualActivities(
  repository: ManualActivityRepository,
  filter: ListManualActivitiesFilter = {},
): Promise<ManualActivity[]> {
  return repository.list(filter);
}
