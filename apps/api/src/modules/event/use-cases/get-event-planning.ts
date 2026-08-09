import {
  buildEventPlanning,
  EventNotFoundError,
  type EventItemPlanningInput,
  type EventItemRepository,
  type EventPlanning,
  type EventRepository,
  type ManufacturingSetup,
  type ProductRepository,
  type RecipeVersionRepository,
  type StockMovementRepository,
  type VariantRepository,
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
 * Monta o planejamento do evento.
 *
 * Nada aqui é persistido: estoque vem da soma das movimentações (D-011) e a
 * configuração de fabricação é resolvida pelo módulo de Receitas (D-014). O uso
 * cases apenas reúne os insumos e delega o cálculo ao domínio.
 */
export async function getEventPlanning(
  { events, items, variants, products, movements, versions }: Dependencies,
  eventId: string,
): Promise<EventPlanning> {
  const event = await events.findById(eventId);

  if (!event) {
    throw new EventNotFoundError(eventId);
  }

  const eventItems = await items.listByEvent(eventId);

  const inputs = await Promise.all(
    eventItems.map(async (item): Promise<EventItemPlanningInput | null> => {
      const variant = await variants.findById(item.variantId);
      if (!variant) return null;

      const [product, currentStock, currentVersion] = await Promise.all([
        products.findById(variant.productId),
        movements.sumQuantityByVariant(item.variantId),
        versions.findCurrentByVariant(item.variantId),
      ]);

      const setup: ManufacturingSetup | null = currentVersion
        ? {
            recipeId: currentVersion.recipe.id,
            recipeName: currentVersion.recipe.name,
            versionId: currentVersion.id,
            version: currentVersion.version,
            estimatedPrintTimeMinutes: currentVersion.estimatedPrintTimeMinutes,
            estimatedFilamentGrams: currentVersion.estimatedFilamentGrams,
            estimatedCost: currentVersion.estimatedCost,
          }
        : null;

      return {
        itemId: item.id,
        variantId: variant.id,
        variantAttributes: variant.attributes,
        variantSku: variant.sku,
        productId: variant.productId,
        productName: product?.name ?? '—',
        targetQuantity: item.targetQuantity,
        currentStock,
        setup,
      };
    }),
  );

  return buildEventPlanning(
    inputs.filter((input): input is EventItemPlanningInput => input !== null),
  );
}
