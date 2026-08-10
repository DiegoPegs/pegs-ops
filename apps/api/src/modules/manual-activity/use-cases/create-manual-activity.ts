import type {
  CreateManualActivityData,
  ManualActivity,
  ManualActivityRepository,
} from '@pegs-ops/domain';

export async function createManualActivity(
  repository: ManualActivityRepository,
  input: CreateManualActivityData,
): Promise<ManualActivity> {
  return repository.create(input);
}
