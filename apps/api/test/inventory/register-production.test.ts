import { InvalidMovementQuantityError, VariantNotFoundError } from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { getCurrentStock } from '../../src/modules/inventory/use-cases/get-current-stock.js';
import { registerProduction } from '../../src/modules/inventory/use-cases/register-production.js';
import { InMemoryProductRepository } from '../product/in-memory-product.repository.js';
import { InMemoryVariantRepository } from '../variant/in-memory-variant.repository.js';
import {
  InMemoryStockMovementRepository,
  InMemoryStockMovementTypeRepository,
} from './in-memory-inventory.repository.js';

describe('registerProduction', () => {
  let movements: InMemoryStockMovementRepository;
  let movementTypes: InMemoryStockMovementTypeRepository;
  let variants: InMemoryVariantRepository;
  let variantId: string;

  const produzir = (quantity: number) =>
    registerProduction(movements, movementTypes, variants, { variantId, quantity });

  beforeEach(async () => {
    movements = new InMemoryStockMovementRepository();
    movementTypes = new InMemoryStockMovementTypeRepository();
    variants = new InMemoryVariantRepository();

    const products = new InMemoryProductRepository();
    const product = await products.create({ name: 'Porta Jóias' });
    const variant = await variants.create(product.id, {
      attributes: [{ name: 'Modelo', value: 'Gato' }],
    });
    variantId = variant.id;
  });

  it('cria uma movimentação do tipo PRODUCTION, somando ao estoque', async () => {
    const movement = await produzir(3);

    expect(movement.movementType.code).toBe('PRODUCTION');
    expect(movement.quantity).toBe(3);
    await expect(getCurrentStock(movements, variants, variantId)).resolves.toMatchObject({
      balance: 3,
    });
  });

  it('não usa nenhum outro tipo de movimentação', async () => {
    await produzir(2);
    await produzir(5);

    expect(movements.items.every((item) => item.movementType.code === 'PRODUCTION')).toBe(true);
  });

  it('acumula produções sucessivas no saldo', async () => {
    await produzir(2);
    await produzir(5);

    await expect(getCurrentStock(movements, variants, variantId)).resolves.toMatchObject({
      balance: 7,
    });
  });

  it('não grava nada quando a quantidade é zero ou negativa', async () => {
    await expect(produzir(0)).rejects.toBeInstanceOf(InvalidMovementQuantityError);
    await expect(produzir(-4)).rejects.toBeInstanceOf(InvalidMovementQuantityError);

    expect(movements.items).toHaveLength(0);
  });

  it('recusa quantidade fracionada', async () => {
    await expect(produzir(1.5)).rejects.toBeInstanceOf(InvalidMovementQuantityError);
  });

  it('falha quando a variante não existe', async () => {
    await expect(
      registerProduction(movements, movementTypes, variants, {
        variantId: 'inexistente',
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(VariantNotFoundError);
  });

  it('não registra preço nem observação', async () => {
    const movement = await produzir(3);

    expect(movement.unitPrice).toBeNull();
    expect(movement.notes).toBeNull();
  });
});
