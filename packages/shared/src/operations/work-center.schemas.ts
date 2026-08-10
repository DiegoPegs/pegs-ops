import { z } from 'zod';

import { manualActivitySchema } from '../manual-activity/manual-activity.schemas.js';

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

/**
 * Item de "Concluídas Hoje". A seção é global da Central: hoje recebe atividades
 * manuais e, adiante, produções e outras ações concluídas no dia.
 */
export const completedTodayItemSchema = z.object({
  id: z.string(),
  kind: z.enum(['MANUAL_ACTIVITY']),
  title: z.string(),
  completedAt: z.string(),
});

export const workCenterSchema = z.object({
  pendingProductions: z.array(pendingProductionSchema),
  /** Atividades manuais pendentes, já ordenadas. */
  activities: z.array(manualActivitySchema),
  completedToday: z.array(completedTodayItemSchema),
  insights: workCenterInsightsSchema,
});

export type ProductionPriorityDto = z.infer<typeof productionPrioritySchema>;
export type PendingProductionDto = z.infer<typeof pendingProductionSchema>;
export type PendingProductionOriginDto = z.infer<typeof pendingProductionOriginSchema>;
export type WorkCenterDto = z.infer<typeof workCenterSchema>;
export type CompletedTodayItemDto = z.infer<typeof completedTodayItemSchema>;
