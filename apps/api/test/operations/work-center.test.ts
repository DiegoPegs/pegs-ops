import {
  allocateStock,
  buildWorkCenter,
  daysUntil,
  priorityFor,
  sortByUrgency,
  type PendingProduction,
  type ProductionDemand,
  type ActivityBoard,
  type CompletedTodayItem,
  type VariantDemandInput,
} from '@pegs-ops/domain';
import { describe, expect, it } from 'vitest';

/** A Central desta suíte só exercita produções; atividades têm suíte própria. */
const SEM_ATIVIDADES: ActivityBoard = { toDo: [], completedToday: [] };
const SEM_PRODUCOES: CompletedTodayItem[] = [];

const HOJE = new Date('2026-08-10T09:00:00Z');

function demanda(overrides: Partial<ProductionDemand> = {}): ProductionDemand {
  return {
    eventId: 'evento-1',
    eventName: 'Feira Geek',
    eventDate: new Date('2026-08-25T00:00:00Z'),
    targetQuantity: 10,
    ...overrides,
  };
}

function variante(overrides: Partial<VariantDemandInput> = {}): VariantDemandInput {
  return {
    variantId: 'variante-1',
    productName: 'Porta Jóias',
    variantAttributes: [],
    variantSku: null,
    currentStock: 0,
    estimatedPrintTimeMinutes: 185,
    estimatedFilamentGrams: 183,
    material: 'PLA Matte',
    demands: [demanda()],
    ...overrides,
  };
}

describe('daysUntil', () => {
  it('conta dias inteiros, ignorando a hora', () => {
    expect(daysUntil(new Date('2026-08-11T23:00:00Z'), HOJE)).toBe(1);
    expect(daysUntil(new Date('2026-08-10T01:00:00Z'), HOJE)).toBe(0);
    expect(daysUntil(new Date('2026-08-08T00:00:00Z'), HOJE)).toBe(-2);
  });
});

describe('priorityFor', () => {
  it('classifica pelo prazo', () => {
    expect(priorityFor(-1)).toBe('OVERDUE');
    expect(priorityFor(0)).toBe('TODAY');
    expect(priorityFor(2)).toBe('URGENT');
    expect(priorityFor(7)).toBe('SOON');
    expect(priorityFor(8)).toBe('PLANNED');
  });
});

describe('allocateStock', () => {
  it('consome o estoque do evento mais próximo para o mais distante', () => {
    const origins = allocateStock(
      [
        demanda({
          eventId: 'feira',
          eventName: 'Feira Geek',
          eventDate: new Date('2026-08-25T00:00:00Z'),
          targetQuantity: 10,
        }),
        demanda({
          eventId: 'cliente',
          eventName: 'Cliente João',
          eventDate: new Date('2026-08-11T00:00:00Z'),
          targetQuantity: 20,
        }),
      ],
      5,
      HOJE,
    );

    // O cliente é amanhã: consome os 5 e ainda precisa de 15.
    expect(origins[0]).toMatchObject({ eventId: 'cliente', quantity: 15 });
    // A feira vem depois e não encontra estoque sobrando.
    expect(origins[1]).toMatchObject({ eventId: 'feira', quantity: 10 });
  });

  it('nunca conta o mesmo estoque duas vezes', () => {
    const origins = allocateStock(
      [
        demanda({ eventId: 'a', targetQuantity: 20, eventDate: new Date('2026-08-12T00:00:00Z') }),
        demanda({ eventId: 'b', targetQuantity: 10, eventDate: new Date('2026-08-20T00:00:00Z') }),
      ],
      5,
      HOJE,
    );

    const total = origins.reduce((soma, origin) => soma + origin.quantity, 0);

    expect(total).toBe(25);
  });

  it('zera a necessidade quando o estoque cobre tudo', () => {
    const origins = allocateStock(
      [
        demanda({ eventId: 'a', targetQuantity: 5, eventDate: new Date('2026-08-12T00:00:00Z') }),
        demanda({ eventId: 'b', targetQuantity: 4, eventDate: new Date('2026-08-20T00:00:00Z') }),
      ],
      30,
      HOJE,
    );

    expect(origins.every((origin) => origin.quantity === 0)).toBe(true);
  });

  it('cobra um déficit de estoque uma única vez', () => {
    const origins = allocateStock(
      [
        demanda({ eventId: 'a', targetQuantity: 10, eventDate: new Date('2026-08-12T00:00:00Z') }),
        demanda({ eventId: 'b', targetQuantity: 10, eventDate: new Date('2026-08-20T00:00:00Z') }),
      ],
      -3,
      HOJE,
    );

    expect(origins[0]?.quantity).toBe(13);
    expect(origins[1]?.quantity).toBe(10);
  });
});

describe('buildWorkCenter', () => {
  it('agrupa a mesma variante em um card com todas as origens', () => {
    const { pendingProductions } = buildWorkCenter(
      [
        variante({
          currentStock: 0,
          demands: [
            demanda({
              eventId: 'cliente',
              eventName: 'Cliente João',
              eventDate: new Date('2026-08-11T00:00:00Z'),
              targetQuantity: 2,
            }),
            demanda({
              eventId: 'feira',
              eventName: 'Feira Geek',
              eventDate: new Date('2026-08-25T00:00:00Z'),
              targetQuantity: 5,
            }),
          ],
        }),
      ],
      SEM_ATIVIDADES,
      SEM_PRODUCOES,
      HOJE,
    );

    expect(pendingProductions).toHaveLength(1);

    const card = pendingProductions[0]!;
    expect(card.toProduce).toBe(7);
    expect(card.origins).toHaveLength(2);
    expect(card.origins[0]).toMatchObject({ eventName: 'Cliente João', quantity: 2 });
    expect(card.origins[1]).toMatchObject({ eventName: 'Feira Geek', quantity: 5 });
  });

  it('usa o prazo mais urgente das origens para priorizar o card', () => {
    const { pendingProductions } = buildWorkCenter(
      [
        variante({
          demands: [
            demanda({ eventId: 'longe', eventDate: new Date('2026-09-30T00:00:00Z') }),
            demanda({ eventId: 'amanha', eventDate: new Date('2026-08-11T00:00:00Z') }),
          ],
        }),
      ],
      SEM_ATIVIDADES,
      SEM_PRODUCOES,
      HOJE,
    );

    expect(pendingProductions[0]?.daysRemaining).toBe(1);
    expect(pendingProductions[0]?.priority).toBe('URGENT');
  });

  it('não cria card quando o estoque já cobre a demanda', () => {
    const { pendingProductions } = buildWorkCenter(
      [variante({ currentStock: 50, demands: [demanda({ targetQuantity: 10 })] })],
      SEM_ATIVIDADES,
      SEM_PRODUCOES,
      HOJE,
    );

    expect(pendingProductions).toHaveLength(0);
  });

  it('mantém o tempo desconhecido quando não há receita vigente', () => {
    const { pendingProductions, insights } = buildWorkCenter(
      [
        variante({
          estimatedPrintTimeMinutes: null,
          estimatedFilamentGrams: null,
          material: null,
        }),
      ],
      SEM_ATIVIDADES,
      SEM_PRODUCOES,
      HOJE,
    );

    expect(pendingProductions[0]?.estimatedPrintTimeMinutes).toBeNull();
    expect(insights.totalPrintTimeMinutes).toBe(0);
    expect(insights.variantsWithoutSetup).toBe(1);
  });
});

describe('sortByUrgency', () => {
  it('ordena por prazo e nunca por quantidade', () => {
    const cards = [
      { productName: 'Muito volume', daysRemaining: 20, toProduce: 500 },
      { productName: 'Pouca coisa', daysRemaining: 1, toProduce: 2 },
      { productName: 'Atrasado', daysRemaining: -3, toProduce: 1 },
    ] as PendingProduction[];

    expect(sortByUrgency(cards).map((card) => card.productName)).toEqual([
      'Atrasado',
      'Pouca coisa',
      'Muito volume',
    ]);
  });

  it('desempata pelo nome, mantendo a ordem estável', () => {
    const cards = [
      { productName: 'Vaso', daysRemaining: 5, toProduce: 1 },
      { productName: 'Chaveiro', daysRemaining: 5, toProduce: 99 },
    ] as PendingProduction[];

    expect(sortByUrgency(cards).map((card) => card.productName)).toEqual(['Chaveiro', 'Vaso']);
  });
});

describe('insights', () => {
  it('soma tempo e agrupa filamento por material', () => {
    const { insights } = buildWorkCenter(
      [
        variante({
          variantId: 'a',
          material: 'PLA Matte',
          estimatedPrintTimeMinutes: 100,
          estimatedFilamentGrams: 50,
          demands: [demanda({ targetQuantity: 3 })],
        }),
        variante({
          variantId: 'b',
          productName: 'Vaso',
          material: 'PETG',
          estimatedPrintTimeMinutes: 200,
          estimatedFilamentGrams: 80,
          demands: [demanda({ eventId: 'e2', targetQuantity: 2 })],
        }),
        variante({
          variantId: 'c',
          productName: 'Chaveiro',
          material: 'PLA Matte',
          estimatedPrintTimeMinutes: 10,
          estimatedFilamentGrams: 5,
          demands: [demanda({ eventId: 'e3', targetQuantity: 4 })],
        }),
      ],
      SEM_ATIVIDADES,
      SEM_PRODUCOES,
      HOJE,
    );

    expect(insights.totalPrintTimeMinutes).toBe(3 * 100 + 2 * 200 + 4 * 10);
    expect(insights.filamentByMaterial).toEqual([
      { material: 'PLA Matte', grams: 3 * 50 + 4 * 5 },
      { material: 'PETG', grams: 2 * 80 },
    ]);
  });

  it('aponta o próximo evento e ignora os que já passaram', () => {
    const { insights } = buildWorkCenter(
      [
        variante({
          demands: [
            demanda({
              eventId: 'passado',
              eventName: 'Feira passada',
              eventDate: new Date('2026-08-01T00:00:00Z'),
            }),
            demanda({
              eventId: 'proximo',
              eventName: 'Feira Geek',
              eventDate: new Date('2026-08-20T00:00:00Z'),
            }),
          ],
        }),
      ],
      SEM_ATIVIDADES,
      SEM_PRODUCOES,
      HOJE,
    );

    expect(insights.nextEvent).toMatchObject({ eventName: 'Feira Geek', daysRemaining: 10 });
  });

  it('não expõe custo, margem ou preço', () => {
    const { insights, pendingProductions } = buildWorkCenter(
      [variante()],
      SEM_ATIVIDADES,
      SEM_PRODUCOES,
      HOJE,
    );

    const serialized = JSON.stringify({ insights, pendingProductions });

    expect(serialized).not.toMatch(/cost|price|margin|custo|preço|margem/i);
  });
});
