import { z } from 'zod';

/** Campos de texto opcionais chegam vazios dos formulários; normalizamos para null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .nullish()
    .transform((value) => (value == null || value === '' ? null : value));

export const variantAttributeInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome do atributo é obrigatório.')
    .max(60, 'Máximo de 60 caracteres.'),
  value: z
    .string()
    .trim()
    .min(1, 'Valor do atributo é obrigatório.')
    .max(200, 'Máximo de 200 caracteres.'),
});

export const createVariantSchema = z.object({
  sku: optionalText(60),
  attributes: z.array(variantAttributeInputSchema).default([]),
});

export const updateVariantSchema = createVariantSchema.partial();

export const listVariantsQuerySchema = z.object({
  includeArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export const variantIdParamsSchema = z.object({
  id: z.uuid('Identificador inválido.'),
});

/** Nome distinto do productIdParamsSchema do módulo Product, que usa `id`. */
export const productIdPathParamsSchema = z.object({
  productId: z.uuid('Identificador de produto inválido.'),
});

export const variantAttributeSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  name: z.string(),
  value: z.string(),
});

/** Formato da Variant como trafega na API (datas em ISO 8601). */
export const variantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string().nullable(),
  attributes: z.array(variantAttributeSchema),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type VariantFormValues = z.input<typeof createVariantSchema>;
export type CreateVariantInput = z.output<typeof createVariantSchema>;
export type UpdateVariantInput = z.output<typeof updateVariantSchema>;
export type ListVariantsQuery = z.output<typeof listVariantsQuerySchema>;
export type VariantDto = z.infer<typeof variantSchema>;
export type VariantAttributeDto = z.infer<typeof variantAttributeSchema>;
