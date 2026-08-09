import type { VariantAttribute } from '../variant/variant.entity.js';

/**
 * Urgência de um card, derivada do prazo mais próximo.
 * A ordenação nunca considera quantidade.
 */
export type ProductionPriority = 'OVERDUE' | 'TODAY' | 'URGENT' | 'SOON' | 'PLANNED';

/** Uma demanda de produção vinda de um evento, antes do consumo de estoque. */
export interface ProductionDemand {
  eventId: string;
  eventName: string;
  eventDate: Date;
  targetQuantity: number;
}

/** Insumos por variante, reunidos pela camada de aplicação. */
export interface VariantDemandInput {
  variantId: string;
  productName: string;
  variantAttributes: VariantAttribute[];
  variantSku: string | null;
  currentStock: number;
  /** Configuração de fabricação vigente (D-014); nula quando não há receita. */
  estimatedPrintTimeMinutes: number | null;
  estimatedFilamentGrams: number | null;
  material: string | null;
  demands: ProductionDemand[];
}

/** Origem da demanda já com a necessidade remanescente calculada. */
export interface PendingProductionOrigin {
  eventId: string;
  eventName: string;
  eventDate: Date;
  daysRemaining: number;
  quantity: number;
}

export interface PendingProduction {
  variantId: string;
  productName: string;
  variantAttributes: VariantAttribute[];
  variantSku: string | null;
  currentStock: number;
  toProduce: number;
  priority: ProductionPriority;
  /** Prazo mais próximo entre as origens: é ele que define a prioridade. */
  daysRemaining: number;
  origins: PendingProductionOrigin[];
  estimatedPrintTimeMinutes: number | null;
  material: string | null;
}

export interface FilamentByMaterial {
  material: string;
  grams: number;
}

export interface NextEvent {
  eventId: string;
  eventName: string;
  eventDate: Date;
  daysRemaining: number;
}

export interface WorkCenterInsights {
  totalPrintTimeMinutes: number;
  filamentByMaterial: FilamentByMaterial[];
  nextEvent: NextEvent | null;
  /** Variantes sem receita vigente: entram na produção, mas não nas estimativas. */
  variantsWithoutSetup: number;
}

export interface WorkCenter {
  pendingProductions: PendingProduction[];
  insights: WorkCenterInsights;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Dias inteiros até o evento, contados por data e não por horas.
 *
 * A data do evento é uma data de calendário, gravada como meia-noite UTC, e por
 * isso é lida em UTC. O "hoje" vem do relógio de quem consulta e é lido no fuso
 * local. Misturar os dois deslocaria o prazo em um dia inteiro em fusos
 * negativos — e um evento de amanhã apareceria como sendo hoje.
 */
export function daysUntil(eventDate: Date, today: Date): number {
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const end = Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate());

  return Math.round((end - start) / MS_PER_DAY);
}

export function priorityFor(daysRemaining: number): ProductionPriority {
  if (daysRemaining < 0) return 'OVERDUE';
  if (daysRemaining === 0) return 'TODAY';
  if (daysRemaining <= 2) return 'URGENT';
  if (daysRemaining <= 7) return 'SOON';

  return 'PLANNED';
}

/**
 * Regra de negócio: o estoque de uma Variante é um só e é consumido pelos
 * eventos em ordem de data, do mais próximo para o mais distante. Cada evento
 * só enxerga o que sobrou do anterior.
 *
 * Sem isso, duas demandas da mesma variante contariam o mesmo estoque duas
 * vezes e a Central mandaria produzir menos do que a operação precisa.
 */
export function allocateStock(
  demands: ProductionDemand[],
  currentStock: number,
  today: Date,
): PendingProductionOrigin[] {
  const byDeadline = [...demands].sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  let available = currentStock;

  return byDeadline.map((demand) => {
    const quantity = Math.max(demand.targetQuantity - available, 0);
    // Estoque consumido nunca fica negativo: um déficit já existente é
    // cobrado uma única vez, no evento mais próximo.
    available = Math.max(available - demand.targetQuantity, 0);

    return {
      eventId: demand.eventId,
      eventName: demand.eventName,
      eventDate: demand.eventDate,
      daysRemaining: daysUntil(demand.eventDate, today),
      quantity,
    };
  });
}

/** Uma variante vira um único card, com todas as origens que a exigem. */
export function buildPendingProduction(
  input: VariantDemandInput,
  today: Date,
): PendingProduction | null {
  const origins = allocateStock(input.demands, input.currentStock, today).filter(
    (origin) => origin.quantity > 0,
  );

  if (origins.length === 0) return null;

  const daysRemaining = Math.min(...origins.map((origin) => origin.daysRemaining));
  const toProduce = origins.reduce((total, origin) => total + origin.quantity, 0);

  return {
    variantId: input.variantId,
    productName: input.productName,
    variantAttributes: input.variantAttributes,
    variantSku: input.variantSku,
    currentStock: input.currentStock,
    toProduce,
    priority: priorityFor(daysRemaining),
    daysRemaining,
    origins,
    estimatedPrintTimeMinutes:
      input.estimatedPrintTimeMinutes === null ? null : input.estimatedPrintTimeMinutes * toProduce,
    material: input.material,
  };
}

/** Ordem: menor prazo primeiro; empate resolvido pelo nome, nunca pela quantidade. */
export function sortByUrgency(productions: PendingProduction[]): PendingProduction[] {
  return [...productions].sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining;

    return a.productName.localeCompare(b.productName, 'pt-BR');
  });
}

const SEM_MATERIAL = 'Não informado';

export function buildInsights(
  productions: PendingProduction[],
  inputs: VariantDemandInput[],
  today: Date,
): WorkCenterInsights {
  const totalPrintTimeMinutes = productions.reduce(
    (total, production) => total + (production.estimatedPrintTimeMinutes ?? 0),
    0,
  );

  const gramsByMaterial = new Map<string, number>();

  for (const production of productions) {
    const input = inputs.find((candidate) => candidate.variantId === production.variantId);
    if (!input?.estimatedFilamentGrams) continue;

    const material = production.material ?? SEM_MATERIAL;
    const grams = input.estimatedFilamentGrams * production.toProduce;

    gramsByMaterial.set(material, (gramsByMaterial.get(material) ?? 0) + grams);
  }

  const upcoming = productions
    .flatMap((production) => production.origins)
    .filter((origin) => origin.daysRemaining >= 0)
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  const next = upcoming[0];

  return {
    totalPrintTimeMinutes,
    filamentByMaterial: [...gramsByMaterial.entries()]
      .map(([material, grams]) => ({ material, grams }))
      .sort((a, b) => b.grams - a.grams),
    nextEvent: next
      ? {
          eventId: next.eventId,
          eventName: next.eventName,
          eventDate: next.eventDate,
          daysRemaining: daysUntil(next.eventDate, today),
        }
      : null,
    variantsWithoutSetup: productions.filter(
      (production) => production.estimatedPrintTimeMinutes === null,
    ).length,
  };
}

/** Monta a Central inteira. Nada aqui é persistido: tudo é consulta. */
export function buildWorkCenter(inputs: VariantDemandInput[], today: Date): WorkCenter {
  const pendingProductions = sortByUrgency(
    inputs
      .map((input) => buildPendingProduction(input, today))
      .filter((production): production is PendingProduction => production !== null),
  );

  return {
    pendingProductions,
    insights: buildInsights(pendingProductions, inputs, today),
  };
}
