import { z } from 'zod';

/**
 * Campos de texto opcionais chegam vazios dos formulários; normalizamos para
 * null. O tipo de entrada continua sendo string, o que mantém os schemas
 * utilizáveis diretamente nos formulários do front.
 */
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

const optionalId = z
  .union([z.literal(''), z.uuid('Origem inválida.')])
  .nullish()
  .transform((value) => (value == null || value === '' ? null : value));

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(120, 'Máximo de 120 caracteres.'),
  description: optionalText(2000),
  originId: optionalId,
  originUrl: optionalUrl,
  notes: optionalText(2000),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  includeArchived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true'),
});

export const productIdParamsSchema = z.object({
  id: z.uuid('Identificador inválido.'),
});

export const originSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/** Formato do Product como trafega na API (datas em ISO 8601). */
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  originId: z.string().nullable(),
  originUrl: z.string().nullable(),
  origin: originSchema.nullable(),
  notes: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductFormValues = z.input<typeof createProductSchema>;
export type CreateProductInput = z.output<typeof createProductSchema>;
export type UpdateProductInput = z.output<typeof updateProductSchema>;
export type ListProductsQuery = z.output<typeof listProductsQuerySchema>;
export type ProductDto = z.infer<typeof productSchema>;
export type OriginDto = z.infer<typeof originSchema>;
