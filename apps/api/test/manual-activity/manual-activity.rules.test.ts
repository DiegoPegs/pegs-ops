import {
  buildActivityBoard,
  isSameLocalDay,
  sortCompleted,
  sortToDo,
  type ManualActivity,
} from '@pegs-ops/domain';
import { describe, expect, it } from 'vitest';

const HOJE = new Date('2026-08-10T14:00:00');

function atividade(overrides: Partial<ManualActivity> = {}): ManualActivity {
  return {
    id: 'atividade-1',
    title: 'Fazer orçamento',
    description: null,
    priority: 'MEDIUM',
    dueDate: null,
    completedAt: null,
    archivedAt: null,
    createdAt: new Date('2026-08-01T10:00:00'),
    updatedAt: new Date('2026-08-01T10:00:00'),
    ...overrides,
  };
}

describe('sortToDo', () => {
  it('ordena primeiro por prioridade', () => {
    const ordenadas = sortToDo([
      atividade({ id: 'baixa', priority: 'LOW' }),
      atividade({ id: 'alta', priority: 'HIGH' }),
      atividade({ id: 'media', priority: 'MEDIUM' }),
    ]);

    expect(ordenadas.map((item) => item.id)).toEqual(['alta', 'media', 'baixa']);
  });

  it('dentro da mesma prioridade, ordena pelo prazo', () => {
    const ordenadas = sortToDo([
      atividade({ id: 'depois', dueDate: new Date('2026-08-20') }),
      atividade({ id: 'antes', dueDate: new Date('2026-08-12') }),
    ]);

    expect(ordenadas.map((item) => item.id)).toEqual(['antes', 'depois']);
  });

  it('coloca quem não tem prazo depois de quem tem', () => {
    const ordenadas = sortToDo([
      atividade({ id: 'sem-prazo' }),
      atividade({ id: 'com-prazo', dueDate: new Date('2026-09-30') }),
    ]);

    expect(ordenadas.map((item) => item.id)).toEqual(['com-prazo', 'sem-prazo']);
  });

  it('desempata pela data de criação', () => {
    const ordenadas = sortToDo([
      atividade({ id: 'nova', createdAt: new Date('2026-08-05T10:00:00') }),
      atividade({ id: 'antiga', createdAt: new Date('2026-08-01T10:00:00') }),
    ]);

    expect(ordenadas.map((item) => item.id)).toEqual(['antiga', 'nova']);
  });

  it('prioridade vence o prazo', () => {
    const ordenadas = sortToDo([
      atividade({ id: 'media-urgente', priority: 'MEDIUM', dueDate: new Date('2026-08-11') }),
      atividade({ id: 'alta-tranquila', priority: 'HIGH', dueDate: new Date('2026-12-31') }),
    ]);

    expect(ordenadas.map((item) => item.id)).toEqual(['alta-tranquila', 'media-urgente']);
  });
});

describe('sortCompleted', () => {
  it('mostra as mais recentes primeiro', () => {
    const ordenadas = sortCompleted([
      atividade({ id: 'manha', completedAt: new Date('2026-08-10T09:00:00') }),
      atividade({ id: 'tarde', completedAt: new Date('2026-08-10T16:00:00') }),
    ]);

    expect(ordenadas.map((item) => item.id)).toEqual(['tarde', 'manha']);
  });
});

describe('isSameLocalDay', () => {
  it('compara pelo dia local, não pelo UTC', () => {
    expect(isSameLocalDay(new Date('2026-08-10T23:30:00'), HOJE)).toBe(true);
    expect(isSameLocalDay(new Date('2026-08-09T23:30:00'), HOJE)).toBe(false);
  });
});

describe('buildActivityBoard', () => {
  it('separa pendentes de concluídas hoje', () => {
    const board = buildActivityBoard(
      [
        atividade({ id: 'pendente' }),
        atividade({ id: 'concluida-hoje', completedAt: new Date('2026-08-10T08:00:00') }),
      ],
      HOJE,
    );

    expect(board.toDo.map((item) => item.id)).toEqual(['pendente']);
    expect(board.completedToday.map((item) => item.id)).toEqual(['concluida-hoje']);
  });

  it('esconde as concluídas em dias anteriores', () => {
    const board = buildActivityBoard(
      [atividade({ id: 'ontem', completedAt: new Date('2026-08-09T18:00:00') })],
      HOJE,
    );

    expect(board.toDo).toHaveLength(0);
    expect(board.completedToday).toHaveLength(0);
  });

  it('nunca mostra atividades arquivadas', () => {
    const board = buildActivityBoard(
      [
        atividade({ id: 'arquivada-pendente', archivedAt: new Date('2026-08-05') }),
        atividade({
          id: 'arquivada-concluida',
          completedAt: new Date('2026-08-10T08:00:00'),
          archivedAt: new Date('2026-08-10T09:00:00'),
        }),
      ],
      HOJE,
    );

    expect(board.toDo).toHaveLength(0);
    expect(board.completedToday).toHaveLength(0);
  });

  it('entrega as duas listas já ordenadas', () => {
    const board = buildActivityBoard(
      [
        atividade({ id: 'baixa', priority: 'LOW' }),
        atividade({ id: 'alta', priority: 'HIGH' }),
        atividade({ id: 'cedo', completedAt: new Date('2026-08-10T07:00:00') }),
        atividade({ id: 'agora', completedAt: new Date('2026-08-10T13:00:00') }),
      ],
      HOJE,
    );

    expect(board.toDo.map((item) => item.id)).toEqual(['alta', 'baixa']);
    expect(board.completedToday.map((item) => item.id)).toEqual(['agora', 'cedo']);
  });
});
