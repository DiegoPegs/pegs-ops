import { createRecipeSchema, createRecipeVersionSchema } from '@pegs-ops/shared';
import { describe, expect, it } from 'vitest';

describe('schemas de Recipe', () => {
  it('exige o nome da receita', () => {
    expect(createRecipeSchema.safeParse({ name: '  ' }).success).toBe(false);
    expect(createRecipeSchema.safeParse({ name: 'Produção' }).success).toBe(true);
  });

  it('converte descrição vazia em null', () => {
    expect(createRecipeSchema.parse({ name: 'Produção', description: '' }).description).toBeNull();
  });
});

describe('schemas de RecipeVersion', () => {
  it('aceita versão sem nenhum campo, com isDefault false por padrão', () => {
    const result = createRecipeVersionSchema.parse({});

    expect(result.printerName).toBeNull();
    expect(result.estimatedPrintTimeMinutes).toBeNull();
    expect(result.estimatedFilamentGrams).toBeNull();
    expect(result.estimatedCost).toBeNull();
    expect(result.isDefault).toBe(false);
  });

  it('aceita os valores do cenário de aceite', () => {
    const result = createRecipeVersionSchema.parse({
      printerName: 'Bambu Lab A1',
      estimatedPrintTimeMinutes: 210,
      estimatedFilamentGrams: 186,
      material: 'PLA Matte',
      estimatedCost: 8.4,
      modelSourceUrl: 'https://makerworld.com/models/1',
    });

    expect(result.estimatedPrintTimeMinutes).toBe(210);
    expect(result.estimatedFilamentGrams).toBe(186);
    expect(result.estimatedCost).toBe(8.4);
  });

  it('aceita gramas fracionadas', () => {
    expect(
      createRecipeVersionSchema.parse({ estimatedFilamentGrams: 185.4 }).estimatedFilamentGrams,
    ).toBe(185.4);
  });

  it('recusa tempo não inteiro, negativo ou em texto', () => {
    expect(createRecipeVersionSchema.safeParse({ estimatedPrintTimeMinutes: 12.5 }).success).toBe(
      false,
    );
    expect(createRecipeVersionSchema.safeParse({ estimatedPrintTimeMinutes: -5 }).success).toBe(
      false,
    );
    expect(
      createRecipeVersionSchema.safeParse({ estimatedPrintTimeMinutes: '3h45min' }).success,
    ).toBe(false);
  });

  it('recusa custo negativo e aceita zero', () => {
    const negativo = createRecipeVersionSchema.safeParse({ estimatedCost: -1 });
    expect(negativo.success).toBe(false);
    expect(negativo.error?.issues[0]?.message).toBe('O custo não pode ser negativo.');

    expect(createRecipeVersionSchema.safeParse({ estimatedCost: 0 }).success).toBe(true);
  });

  it('recusa URL de modelo inválida', () => {
    expect(createRecipeVersionSchema.safeParse({ modelSourceUrl: 'nao-url' }).success).toBe(false);
  });
});
