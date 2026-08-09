import { createVariantSchema, updateVariantSchema } from '@pegs-ops/shared';
import { describe, expect, it } from 'vitest';

describe('schemas de Variant', () => {
  it('aceita variante sem sku e sem atributos', () => {
    const result = createVariantSchema.parse({});

    expect(result.sku).toBeNull();
    expect(result.attributes).toEqual([]);
  });

  it('converte sku vazio em null', () => {
    const result = createVariantSchema.parse({ sku: '  ' });

    expect(result.sku).toBeNull();
  });

  it('aceita atributos livres', () => {
    const result = createVariantSchema.parse({
      attributes: [
        { name: 'Modelo', value: 'Gato' },
        { name: 'Cor', value: 'Branco' },
      ],
    });

    expect(result.attributes).toHaveLength(2);
  });

  it('exige nome e valor em cada atributo', () => {
    expect(
      createVariantSchema.safeParse({ attributes: [{ name: '', value: 'Gato' }] }).success,
    ).toBe(false);
    expect(
      createVariantSchema.safeParse({ attributes: [{ name: 'Modelo', value: '' }] }).success,
    ).toBe(false);
  });

  it('aceita atualização parcial', () => {
    expect(updateVariantSchema.safeParse({ sku: 'PJ-001' }).success).toBe(true);
    expect(updateVariantSchema.safeParse({}).success).toBe(true);
  });
});
