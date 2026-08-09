import {
  buildWorkCenter,
  type EventItemRepository,
  type EventRepository,
  type ProductRepository,
  type ProductionDemand,
  type RecipeVersionRepository,
  type StockMovementRepository,
  type VariantDemandInput,
  type VariantRepository,
  type WorkCenter,
} from '@pegs-ops/domain';

interface Dependencies {
  events: EventRepository;
  items: EventItemRepository;
  variants: VariantRepository;
  products: ProductRepository;
  movements: StockMovementRepository;
  versions: RecipeVersionRepository;
}

/**
 * A Central de Trabalho não é dona de nenhum dado: ela consulta os módulos e
 * organiza o que exige atenção. Nada aqui é persistido.
 *
 * Apenas eventos ativos e ainda planejados geram demanda — um evento realizado
 * ou cancelado não pede produção.
 */
export async function getWorkCenter(
  { events, items, variants, products, movements, versions }: Dependencies,
  today: Date = new Date(),
): Promise<WorkCenter> {
  const activeEvents = (await events.list()).filter((event) => event.status === 'PLANNED');

  // Demandas agrupadas por variante: a mesma variante vira um único card.
  const demandsByVariant = new Map<string, ProductionDemand[]>();

  for (const event of activeEvents) {
    const eventItems = await items.listByEvent(event.id);

    for (const item of eventItems) {
      const demands = demandsByVariant.get(item.variantId) ?? [];

      demands.push({
        eventId: event.id,
        eventName: event.name,
        eventDate: event.eventDate,
        targetQuantity: item.targetQuantity,
      });

      demandsByVariant.set(item.variantId, demands);
    }
  }

  const inputs = await Promise.all(
    [...demandsByVariant.entries()].map(
      async ([variantId, demands]): Promise<VariantDemandInput | null> => {
        const variant = await variants.findById(variantId);
        if (!variant) return null;

        const [product, currentStock, currentVersion] = await Promise.all([
          products.findById(variant.productId),
          movements.sumQuantityByVariant(variantId),
          versions.findCurrentByVariant(variantId),
        ]);

        return {
          variantId,
          productName: product?.name ?? '—',
          variantAttributes: variant.attributes,
          variantSku: variant.sku,
          currentStock,
          estimatedPrintTimeMinutes: currentVersion?.estimatedPrintTimeMinutes ?? null,
          estimatedFilamentGrams: currentVersion?.estimatedFilamentGrams ?? null,
          material: currentVersion?.material ?? null,
          demands,
        };
      },
    ),
  );

  return buildWorkCenter(
    inputs.filter((input): input is VariantDemandInput => input !== null),
    today,
  );
}
