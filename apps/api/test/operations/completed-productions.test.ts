import {
  buildWorkCenter,
  type ActivityBoard,
  type CompletedTodayItem,
  type VariantDemandInput,
} from '@pegs-ops/domain';
import { describe, expect, it } from 'vitest';

const HOJE = new Date('2026-08-10T14:00:00');

const SEM_ATIVIDADES: ActivityBoard = { toDo: [], completedToday: [] };

function producao(overrides: Partial<CompletedTodayItem> = {}): CompletedTodayItem {
  return {
    id: 'movimentacao-1',
    kind: 'PRODUCTION',
    title: 'Porta Jóias Gato',
    completedAt: new Date('2026-08-10T10:00:00'),
    quantity: 3,
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
    demands: [
      {
        eventId: 'feira',
        eventName: 'Feira Geek',
        eventDate: new Date('2026-08-25T00:00:00Z'),
        targetQuantity: 7,
      },
    ],
    ...overrides,
  };
}

describe('produções em "Concluídas Hoje"', () => {
  it('mostra a produção mesmo com o card ainda pendente', () => {
    // Produziu 3 de uma necessidade de 7: o card continua, e o feito aparece.
    const { pendingProductions, completedToday } = buildWorkCenter(
      [variante({ currentStock: 3 })],
      SEM_ATIVIDADES,
      [producao({ quantity: 3 })],
      HOJE,
    );

    expect(pendingProductions[0]?.toProduce).toBe(4);
    expect(completedToday).toHaveLength(1);
    expect(completedToday[0]).toMatchObject({ kind: 'PRODUCTION', quantity: 3 });
  });

  it('mantém a produção depois de a necessidade zerar', () => {
    const { pendingProductions, completedToday } = buildWorkCenter(
      [variante({ currentStock: 7 })],
      SEM_ATIVIDADES,
      [producao({ quantity: 7 })],
      HOJE,
    );

    expect(pendingProductions).toHaveLength(0);
    expect(completedToday).toHaveLength(1);
  });

  it('mistura produções e atividades, das mais recentes para as mais antigas', () => {
    const { completedToday } = buildWorkCenter(
      [],
      {
        toDo: [],
        completedToday: [
          {
            id: 'atividade-1',
            title: 'Fazer orçamento',
            description: null,
            priority: 'MEDIUM',
            dueDate: null,
            completedAt: new Date('2026-08-10T12:00:00'),
            archivedAt: null,
            createdAt: new Date('2026-08-01T10:00:00'),
            updatedAt: new Date('2026-08-01T10:00:00'),
          },
        ],
      },
      [
        producao({ id: 'cedo', completedAt: new Date('2026-08-10T08:00:00') }),
        producao({ id: 'agora', completedAt: new Date('2026-08-10T13:30:00') }),
      ],
      HOJE,
    );

    expect(completedToday.map((item) => item.id)).toEqual(['agora', 'atividade-1', 'cedo']);
  });

  it('atividade concluída não carrega quantidade', () => {
    const { completedToday } = buildWorkCenter(
      [],
      {
        toDo: [],
        completedToday: [
          {
            id: 'atividade-1',
            title: 'Testar STL',
            description: null,
            priority: 'LOW',
            dueDate: null,
            completedAt: new Date('2026-08-10T09:00:00'),
            archivedAt: null,
            createdAt: new Date('2026-08-01T10:00:00'),
            updatedAt: new Date('2026-08-01T10:00:00'),
          },
        ],
      },
      [],
      HOJE,
    );

    expect(completedToday[0]).toMatchObject({ kind: 'MANUAL_ACTIVITY', quantity: null });
  });
});
