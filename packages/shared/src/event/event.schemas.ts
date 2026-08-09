import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .nullish()
    .transform((value) => (value == null || value === '' ? null : value));

export const eventStatusSchema = z.enum(['PLANNED', 'DONE', 'CANCELLED']);

export const createEventSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(120, 'Máximo de 120 caracteres.'),
  eventDate: z.iso.date('Informe uma data válida.'),
  status: eventStatusSchema.optional().default('PLANNED'),
  notes: optionalText(2000),
});

export const updateEventSchema = createEventSchema.partial();

export const createEventItemSchema = z.object({
  variantId: z.uuid('Identificador de variante inválido.'),
  targetQuantity: z
    .number()
    .int('A meta deve ser um número inteiro.')
    .positive('A meta deve ser maior que zero.'),
});

/** Apenas a Meta pode ser editada; o resto é calculado. */
export const updateEventItemSchema = z.object({
  targetQuantity: z
    .number()
    .int('A meta deve ser um número inteiro.')
    .positive('A meta deve ser maior que zero.'),
});

export const listEventsQuerySchema = z.object({
  includeArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export const eventIdParamsSchema = z.object({
  id: z.uuid('Identificador inválido.'),
});

export const eventIdPathParamsSchema = z.object({
  eventId: z.uuid('Identificador de evento inválido.'),
});

export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  eventDate: z.string(),
  status: eventStatusSchema,
  notes: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const manufacturingSetupSchema = z.object({
  recipeId: z.string(),
  recipeName: z.string(),
  versionId: z.string(),
  version: z.number(),
  estimatedPrintTimeMinutes: z.number().nullable(),
  estimatedFilamentGrams: z.number().nullable(),
  estimatedCost: z.number().nullable(),
});

export const eventItemPlanningSchema = z.object({
  itemId: z.string(),
  variantId: z.string(),
  variantSku: z.string().nullable(),
  variantAttributes: z.array(
    z.object({ id: z.string(), variantId: z.string(), name: z.string(), value: z.string() }),
  ),
  productId: z.string(),
  productName: z.string(),
  targetQuantity: z.number(),
  currentStock: z.number(),
  toProduce: z.number(),
  estimatedPrintTimeMinutes: z.number().nullable(),
  estimatedFilamentGrams: z.number().nullable(),
  estimatedCost: z.number().nullable(),
  setup: manufacturingSetupSchema.nullable(),
});

export const eventPlanningSchema = z.object({
  items: z.array(eventItemPlanningSchema),
  summary: z.object({
    totalTarget: z.number(),
    totalToProduce: z.number(),
    totalPrintTimeMinutes: z.number(),
    totalFilamentGrams: z.number(),
    totalCost: z.number(),
    itemsWithoutSetup: z.number(),
  }),
});

export type EventFormValues = z.input<typeof createEventSchema>;
export type CreateEventInput = z.output<typeof createEventSchema>;
export type UpdateEventInput = z.output<typeof updateEventSchema>;
export type CreateEventItemInput = z.output<typeof createEventItemSchema>;
export type UpdateEventItemInput = z.output<typeof updateEventItemSchema>;
export type EventDto = z.infer<typeof eventSchema>;
export type EventStatusDto = z.infer<typeof eventStatusSchema>;
export type EventItemPlanningDto = z.infer<typeof eventItemPlanningSchema>;
export type EventPlanningDto = z.infer<typeof eventPlanningSchema>;
