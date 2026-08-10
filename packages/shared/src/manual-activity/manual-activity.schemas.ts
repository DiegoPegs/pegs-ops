import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .nullish()
    .transform((value) => (value == null || value === '' ? null : value));

/** Datas opcionais chegam do formulário como "YYYY-MM-DD" ou vazio. */
const optionalDate = z
  .union([z.literal(''), z.iso.date('Informe uma data válida.')])
  .nullish()
  .transform((value) => (value == null || value === '' ? null : value));

export const activityPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createManualActivitySchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório.').max(200, 'Máximo de 200 caracteres.'),
  description: optionalText(2000),
  priority: activityPrioritySchema.optional().default('MEDIUM'),
  dueDate: optionalDate,
});

export const updateManualActivitySchema = createManualActivitySchema.partial();

export const listManualActivitiesQuerySchema = z.object({
  includeArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export const manualActivityIdParamsSchema = z.object({
  id: z.uuid('Identificador inválido.'),
});

export const manualActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: activityPrioritySchema,
  dueDate: z.string().nullable(),
  completedAt: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ManualActivityFormValues = z.input<typeof createManualActivitySchema>;
export type CreateManualActivityInput = z.output<typeof createManualActivitySchema>;
export type UpdateManualActivityInput = z.output<typeof updateManualActivitySchema>;
export type ActivityPriorityDto = z.infer<typeof activityPrioritySchema>;
export type ManualActivityDto = z.infer<typeof manualActivitySchema>;
