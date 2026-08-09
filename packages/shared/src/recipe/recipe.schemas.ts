import { z } from 'zod';

/** Campos de texto opcionais chegam vazios dos formulários; normalizamos para null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .nullish()
    .transform((value) => (value == null || value === '' ? null : value));

const optionalUrl = z
  .union([z.literal(''), z.url('Informe uma URL válida.').max(2048)])
  .nullish()
  .transform((value) => (value == null || value === '' ? null : value));

/**
 * Números opcionais chegam como number ou null — o formulário converte o campo
 * vazio em null antes de enviar, para que as mensagens de validação continuem
 * específicas em vez de virarem um "valor inválido" genérico.
 */
const optionalNumber = (schema: z.ZodNumber) =>
  schema.nullish().transform((value) => value ?? null);

export const createRecipeSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(120, 'Máximo de 120 caracteres.'),
  description: optionalText(2000),
});

export const updateRecipeSchema = createRecipeSchema.partial();

/**
 * `version` não entra no payload: é sequencial por receita e atribuído pelo
 * sistema, sem renumeração nem reuso.
 */
export const createRecipeVersionSchema = z.object({
  printerName: optionalText(120),
  estimatedPrintTimeMinutes: optionalNumber(
    z.number().int('Informe minutos inteiros.').positive('Informe um tempo maior que zero.'),
  ),
  estimatedFilamentGrams: optionalNumber(
    z.number().positive('Informe uma quantidade maior que zero.'),
  ),
  material: optionalText(120),
  estimatedCost: optionalNumber(z.number().nonnegative('O custo não pode ser negativo.')),
  modelSourceUrl: optionalUrl,
  notes: optionalText(2000),
  isDefault: z.boolean().optional().default(false),
});

export const updateRecipeVersionSchema = createRecipeVersionSchema.partial();

export const listArchivableQuerySchema = z.object({
  includeArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export const recipeIdParamsSchema = z.object({
  id: z.uuid('Identificador inválido.'),
});

export const recipeIdPathParamsSchema = z.object({
  recipeId: z.uuid('Identificador de receita inválido.'),
});

export const variantIdPathParamsSchema = z.object({
  variantId: z.uuid('Identificador de variante inválido.'),
});

export const recipeSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const recipeVersionSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  version: z.number(),
  printerName: z.string().nullable(),
  estimatedPrintTimeMinutes: z.number().nullable(),
  estimatedFilamentGrams: z.number().nullable(),
  material: z.string().nullable(),
  estimatedCost: z.number().nullable(),
  modelSourceUrl: z.string().nullable(),
  notes: z.string().nullable(),
  isDefault: z.boolean(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RecipeFormValues = z.input<typeof createRecipeSchema>;
export type CreateRecipeInput = z.output<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.output<typeof updateRecipeSchema>;
export type RecipeVersionFormValues = z.input<typeof createRecipeVersionSchema>;
export type CreateRecipeVersionInput = z.output<typeof createRecipeVersionSchema>;
export type UpdateRecipeVersionInput = z.output<typeof updateRecipeVersionSchema>;
export type RecipeDto = z.infer<typeof recipeSchema>;
export type RecipeVersionDto = z.infer<typeof recipeVersionSchema>;
