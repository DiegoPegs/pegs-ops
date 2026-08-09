import { z } from 'zod';

export const productionPrioritySchema = z.enum(['OVERDUE', 'TODAY', 'URGENT', 'SOON', 'PLANNED']);

export const pendingProductionOriginSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  eventDate: z.string(),
  daysRemaining: z.number(),
  quantity: z.number(),
});

export const pendingProductionSchema = z.object({
  variantId: z.string(),
  productName: z.string(),
  variantAttributes: z.array(
    z.object({ id: z.string(), variantId: z.string(), name: z.string(), value: z.string() }),
  ),
  variantSku: z.string().nullable(),
  currentStock: z.number(),
  toProduce: z.number(),
  priority: productionPrioritySchema,
  daysRemaining: z.number(),
  origins: z.array(pendingProductionOriginSchema),
  estimatedPrintTimeMinutes: z.number().nullable(),
  material: z.string().nullable(),
});

/** Insights não expõem custo, margem ou preço: isso é contexto Comercial. */
export const workCenterInsightsSchema = z.object({
  totalPrintTimeMinutes: z.number(),
  filamentByMaterial: z.array(z.object({ material: z.string(), grams: z.number() })),
  nextEvent: z
    .object({
      eventId: z.string(),
      eventName: z.string(),
      eventDate: z.string(),
      daysRemaining: z.number(),
    })
    .nullable(),
  variantsWithoutSetup: z.number(),
});

export const workCenterSchema = z.object({
  pendingProductions: z.array(pendingProductionSchema),
  insights: workCenterInsightsSchema,
});

export type ProductionPriorityDto = z.infer<typeof productionPrioritySchema>;
export type PendingProductionDto = z.infer<typeof pendingProductionSchema>;
export type PendingProductionOriginDto = z.infer<typeof pendingProductionOriginSchema>;
export type WorkCenterDto = z.infer<typeof workCenterSchema>;

/**
 * Atividade manual: estrutura preparada para a próxima WO, ainda sem
 * persistência. A Central hoje apenas exibe a seção vazia.
 */
export const manualActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['QUOTE', 'TEST_STL', 'PURCHASE', 'REMINDER']),
  dueDate: z.string().nullable(),
  done: z.boolean(),
});

export type ManualActivityDto = z.infer<typeof manualActivitySchema>;
