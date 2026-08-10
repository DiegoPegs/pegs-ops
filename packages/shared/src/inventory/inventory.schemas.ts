import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .nullish()
    .transform((value) => (value == null || value === '' ? null : value));

const optionalNumber = (schema: z.ZodNumber) =>
  schema.nullish().transform((value) => value ?? null);

/**
 * A quantidade é sempre positiva, exceto para tipos BOTH (Ajuste). O sinal é
 * aplicado pelo domínio a partir da direção do tipo, então o schema só garante
 * que o valor é um inteiro diferente de zero.
 */
export const createStockMovementSchema = z.object({
  variantId: z.uuid('Identificador de variante inválido.'),
  movementTypeId: z.uuid('Tipo de movimentação inválido.'),
  quantity: z
    .number()
    .int('A quantidade deve ser um número inteiro.')
    .refine((value) => value !== 0, 'A quantidade não pode ser zero.'),
  unitPrice: optionalNumber(z.number().nonnegative('O valor unitário não pode ser negativo.')),
  notes: optionalText(2000),
});

/** Registro rápido de produção: só a quantidade, sempre positiva. */
export const registerProductionSchema = z.object({
  variantId: z.uuid('Identificador de variante inválido.'),
  quantity: z
    .number('Informe a quantidade produzida.')
    .int('A quantidade deve ser um número inteiro.')
    .positive('Informe uma quantidade maior que zero.'),
});

export const variantIdStockParamsSchema = z.object({
  variantId: z.uuid('Identificador de variante inválido.'),
});

export const stockMovementTypeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  direction: z.enum(['IN', 'OUT', 'BOTH']),
});

export const stockMovementSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  movementTypeId: z.string(),
  quantity: z.number(),
  unitPrice: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  movementType: stockMovementTypeSchema,
});

export const stockBalanceSchema = z.object({
  variantId: z.string(),
  balance: z.number(),
});

export type StockMovementFormValues = z.input<typeof createStockMovementSchema>;
export type CreateStockMovementInput = z.output<typeof createStockMovementSchema>;
export type RegisterProductionInput = z.output<typeof registerProductionSchema>;
export type StockMovementDto = z.infer<typeof stockMovementSchema>;
export type StockMovementTypeDto = z.infer<typeof stockMovementTypeSchema>;
export type StockBalanceDto = z.infer<typeof stockBalanceSchema>;
