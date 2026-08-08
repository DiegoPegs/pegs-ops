import { randomUUID } from 'node:crypto';

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
      originId: '',
      originUrl: '',
      notes: '',
    });

    expect(result.description).toBeNull();
    expect(result.originId).toBeNull();
    expect(result.originUrl).toBeNull();
    expect(result.notes).toBeNull();
  });

  it('aceita origem válida', () => {
    const originId = randomUUID();
    const result = createProductSchema.parse({ name: 'Vaso', originId });

    expect(result.originId).toBe(originId);
  });

  it('rejeita originId que não é uuid', () => {
    const result = createProductSchema.safeParse({ name: 'Vaso', originId: 'makerworld' });

    expect(result.success).toBe(false);
  });

  it('rejeita URL de origem inválida', () => {
    const result = createProductSchema.safeParse({ name: 'Vaso', originUrl: 'não-é-url' });

    expect(result.success).toBe(false);
  });

  it('aceita atualização parcial', () => {
    const result = updateProductSchema.safeParse({ notes: 'Somente observações' });

    expect(result.success).toBe(true);
  });
});
