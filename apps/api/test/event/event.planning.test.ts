import {
  buildEventPlanning,
  calculateItemPlanning,
  calculateToProduce,
  summarizePlanning,
  type EventItemPlanningInput,
  type ManufacturingSetup,
} from '@pegs-ops/domain';
import { describe, expect, it } from 'vitest';

const setup: ManufacturingSetup = {
  recipeId: 'receita-1',
  recipeName: 'Produção',
  versionId: 'versao-2',
  version: 2,
  estimatedPrintTimeMinutes: 185,
  estimatedFilamentGrams: 183,
  estimatedCost: 8.15,
};

function item(overrides: Partial<EventItemPlanningInput> = {}): EventItemPlanningInput {
  return {
    itemId: 'item-1',
    variantId: 'variante-1',
    variantAttributes: [],
    variantSku: null,
    productId: 'produto-1',
    productName: 'Porta Jóias',
    targetQuantity: 20,
    currentStock: 5,
    setup,
    ...overrides,
  };
}

describe('calculateToProduce', () => {
  it('produz apenas o que falta para a meta', () => {
    expect(calculateToProduce(20, 5)).toBe(15);
  });

  it('não produz nada quando o estoque já cobre a meta', () => {
    expect(calculateToProduce(20, 20)).toBe(0);
    expect(calculateToProduce(20, 35)).toBe(0);
  });

  it('trata estoque negativo como ausência de estoque a favor da meta', () => {
    expect(calculateToProduce(10, -3)).toBe(13);
  });
});

describe('calculateItemPlanning', () => {
  it('calcula tempo, filamento e custo sobre o que será produzido', () => {
    const planning = calculateItemPlanning(item({ targetQuantity: 20, currentStock: 5 }));

    expect(planning.toProduce).toBe(15);
    expect(planning.estimatedPrintTimeMinutes).toBe(15 * 185);
    expect(planning.estimatedFilamentGrams).toBe(15 * 183);
    expect(planning.estimatedCost).toBeCloseTo(15 * 8.15, 10);
  });

  it('zera os cálculos quando não há o que produzir', () => {
    const planning = calculateItemPlanning(item({ targetQuantity: 5, currentStock: 10 }));

    expect(planning.toProduce).toBe(0);
    expect(planning.estimatedPrintTimeMinutes).toBe(0);
    expect(planning.estimatedCost).toBe(0);
  });

  it('mantém os cálculos desconhecidos quando não há configuração vigente', () => {
    const planning = calculateItemPlanning(item({ setup: null }));

    expect(planning.toProduce).toBe(15);
    expect(planning.estimatedPrintTimeMinutes).toBeNull();
    expect(planning.estimatedFilamentGrams).toBeNull();
    expect(planning.estimatedCost).toBeNull();
  });

  it('mantém nulo o campo que a versão não informa', () => {
    const planning = calculateItemPlanning(item({ setup: { ...setup, estimatedCost: null } }));

    expect(planning.estimatedPrintTimeMinutes).toBe(15 * 185);
    expect(planning.estimatedCost).toBeNull();
  });
});

describe('summarizePlanning', () => {
  it('consolida metas, produção e estimativas', () => {
    const planning = buildEventPlanning([
      item({ itemId: 'a', targetQuantity: 20, currentStock: 5 }),
      item({ itemId: 'b', variantId: 'variante-2', targetQuantity: 10, currentStock: 10 }),
    ]);

    expect(planning.summary.totalTarget).toBe(30);
    expect(planning.summary.totalToProduce).toBe(15);
    expect(planning.summary.totalPrintTimeMinutes).toBe(15 * 185);
    expect(planning.summary.totalFilamentGrams).toBe(15 * 183);
    expect(planning.summary.totalCost).toBeCloseTo(15 * 8.15, 10);
    expect(planning.summary.itemsWithoutSetup).toBe(0);
  });

  it('ignora estimativas desconhecidas em vez de tratá-las como zero', () => {
    const planning = buildEventPlanning([
      item({ itemId: 'a', targetQuantity: 20, currentStock: 5 }),
      item({
        itemId: 'b',
        variantId: 'variante-2',
        targetQuantity: 4,
        currentStock: 0,
        setup: null,
      }),
    ]);

    expect(planning.summary.totalTarget).toBe(24);
    expect(planning.summary.totalToProduce).toBe(19);
    expect(planning.summary.totalPrintTimeMinutes).toBe(15 * 185);
    expect(planning.summary.itemsWithoutSetup).toBe(1);
  });

  it('devolve zeros para um evento sem itens', () => {
    expect(summarizePlanning([])).toEqual({
      totalTarget: 0,
      totalToProduce: 0,
      totalPrintTimeMinutes: 0,
      totalFilamentGrams: 0,
      totalCost: 0,
      itemsWithoutSetup: 0,
    });
  });
});
