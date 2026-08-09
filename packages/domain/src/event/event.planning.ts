import type { Origin } from '../origin/origin.entity.js';
import type { VariantAttribute } from '../variant/variant.entity.js';

/**
 * Configuração de fabricação vigente da Variante: a versão padrão resolvida
 * pelo módulo de Receitas. O Evento apenas consome — não escolhe receita.
 */
export interface ManufacturingSetup {
  recipeId: string;
  recipeName: string;
  versionId: string;
  version: number;
  estimatedPrintTimeMinutes: number | null;
  estimatedFilamentGrams: number | null;
  estimatedCost: number | null;
}

/** Insumos do cálculo de um item, reunidos pela camada de aplicação. */
export interface EventItemPlanningInput {
  itemId: string;
  variantId: string;
  variantAttributes: VariantAttribute[];
  variantSku: string | null;
  productId: string;
  productName: string;
  productOrigin?: Origin | null;
  targetQuantity: number;
  currentStock: number;
  setup: ManufacturingSetup | null;
}

/** Linha do planejamento: nada aqui é persistido. */
export interface EventItemPlanning extends EventItemPlanningInput {
  toProduce: number;
  estimatedPrintTimeMinutes: number | null;
  estimatedFilamentGrams: number | null;
  estimatedCost: number | null;
}

export interface EventPlanningSummary {
  totalTarget: number;
  totalToProduce: number;
  totalPrintTimeMinutes: number;
  totalFilamentGrams: number;
  totalCost: number;
  /** Itens sem configuração de fabricação vigente não somam nos totais. */
  itemsWithoutSetup: number;
}

export interface EventPlanning {
  items: EventItemPlanning[];
  summary: EventPlanningSummary;
}

/** Só se produz o que falta: Produzir = max(Meta - EstoqueAtual, 0). */
export function calculateToProduce(targetQuantity: number, currentStock: number): number {
  return Math.max(targetQuantity - currentStock, 0);
}

function multiply(unitValue: number | null, quantity: number): number | null {
  return unitValue === null ? null : unitValue * quantity;
}

/**
 * Calcula uma linha do planejamento. Tempo, filamento e custo valem para o que
 * ainda precisa ser produzido — não para a meta inteira.
 */
export function calculateItemPlanning(input: EventItemPlanningInput): EventItemPlanning {
  const toProduce = calculateToProduce(input.targetQuantity, input.currentStock);

  return {
    ...input,
    toProduce,
    estimatedPrintTimeMinutes: multiply(input.setup?.estimatedPrintTimeMinutes ?? null, toProduce),
    estimatedFilamentGrams: multiply(input.setup?.estimatedFilamentGrams ?? null, toProduce),
    estimatedCost: multiply(input.setup?.estimatedCost ?? null, toProduce),
  };
}

/** Consolida o evento. Valores desconhecidos são ignorados, nunca tratados como zero. */
export function summarizePlanning(items: EventItemPlanning[]): EventPlanningSummary {
  return items.reduce<EventPlanningSummary>(
    (summary, item) => ({
      totalTarget: summary.totalTarget + item.targetQuantity,
      totalToProduce: summary.totalToProduce + item.toProduce,
      totalPrintTimeMinutes: summary.totalPrintTimeMinutes + (item.estimatedPrintTimeMinutes ?? 0),
      totalFilamentGrams: summary.totalFilamentGrams + (item.estimatedFilamentGrams ?? 0),
      totalCost: summary.totalCost + (item.estimatedCost ?? 0),
      itemsWithoutSetup: summary.itemsWithoutSetup + (item.setup === null ? 1 : 0),
    }),
    {
      totalTarget: 0,
      totalToProduce: 0,
      totalPrintTimeMinutes: 0,
      totalFilamentGrams: 0,
      totalCost: 0,
      itemsWithoutSetup: 0,
    },
  );
}

export function buildEventPlanning(inputs: EventItemPlanningInput[]): EventPlanning {
  const items = inputs.map(calculateItemPlanning);

  return { items, summary: summarizePlanning(items) };
}
