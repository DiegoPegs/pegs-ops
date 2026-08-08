import { createProductSchema, updateProductSchema } from '@pegs-ops/shared';
import { describe, expect, it } from 'vitest';

describe('schemas de Product', () => {
  it('exige o nome', () => {
    const result = createProductSchema.safeParse({ name: '   ' });

    expect(result.success).toBe(false);
  });

  it('converte campos opcionais vazios em null', () => {
    const result = createProductSchema.parse({
      name: 'Vaso',
      description: '',
      sourceType: '  ',
      notes: '',
    });

    expect(result.description).toBeNull();
    expect(result.sourceType).toBeNull();
    expect(result.notes).toBeNull();
  });

  it('rejeita URL de origem inválida', () => {
    const result = createProductSchema.safeParse({ name: 'Vaso', sourceUrl: 'não-é-url' });

    expect(result.success).toBe(false);
  });

  it('aceita atualização parcial', () => {
    const result = updateProductSchema.safeParse({ notes: 'Somente observações' });

    expect(result.success).toBe(true);
  });
});
