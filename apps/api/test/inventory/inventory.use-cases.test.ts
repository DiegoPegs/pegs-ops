import {
  InvalidMovementQuantityError,
  StockMovementTypeNotFoundError,
  VariantNotFoundError,
} from '@pegs-ops/domain';
import { beforeEach, describe, expect, it } from 'vitest';

import { createStockMovement } from '../../src/modules/inventory/use-cases/create-stock-movement.js';
import { getCurrentStock } from '../../src/modules/inventory/use-cases/get-current-stock.js';
import { listStockMovements } from '../../src/modules/inventory/use-cases/list-stock-movements.js';
import { InMemoryProductRepository } from '../product/in-memory-product.repository.js';
import { InMemoryVariantRepository } from '../variant/in-memory-variant.repository.js';
import {
  InMemoryStockMovementRepository,
  InMemoryStockMovementTypeRepository,
  movementTypeByCode,
} from './in-memory-inventory.repository.js';

describe('use cases de Inventory', () => {
  let movements: InMemoryStockMovementRepository;
  let movementTypes: InMemoryStockMovementTypeRepository;
  let variants: InMemoryVariantRepository;
  let variantId: string;

  const registrar = (code: string, quantity: number, extra: Record<string, unknown> = {}) =>
    createStockMovement(movements, movementTypes, variants, {
      variantId,
      movementTypeId: movementTypeByCode(code).id,
      quantity,
      ...extra,
    });

  const saldo = async () => (await getCurrentStock(movements, variants, variantId)).balance;

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

  describe('sinal aplicado pela direção do tipo', () => {
    it('Produção soma, mesmo recebendo quantidade positiva', async () => {
      const movement = await registrar('PRODUCTION', 20);

      expect(movement.quantity).toBe(20);
      await expect(saldo()).resolves.toBe(20);
    });

    it('Venda Direta subtrai a partir de quantidade positiva', async () => {
      await registrar('PRODUCTION', 20);
      const venda = await registrar('DIRECT_SALE', 2, { unitPrice: 35.5 });

      expect(venda.quantity).toBe(-2);
      expect(venda.unitPrice).toBe(35.5);
    });

    it('Perda subtrai a partir de quantidade positiva', async () => {
      const perda = await registrar('LOSS', 1);

      expect(perda.quantity).toBe(-1);
    });

    it('Ajuste aceita os dois sentidos', async () => {
      const positivo = await registrar('ADJUSTMENT', 3);
      const negativo = await registrar('ADJUSTMENT', -2);

      expect(positivo.quantity).toBe(3);
      expect(negativo.quantity).toBe(-2);
    });

    it('recusa quantidade negativa em tipos de sentido único', async () => {
      await expect(registrar('PRODUCTION', -5)).rejects.toBeInstanceOf(
        InvalidMovementQuantityError,
      );
      await expect(registrar('DIRECT_SALE', -5)).rejects.toBeInstanceOf(
        InvalidMovementQuantityError,
      );
    });

    it('recusa quantidade zero e fracionada', async () => {
      await expect(registrar('ADJUSTMENT', 0)).rejects.toBeInstanceOf(InvalidMovementQuantityError);
      await expect(registrar('PRODUCTION', 1.5)).rejects.toBeInstanceOf(
        InvalidMovementQuantityError,
      );
    });
  });

  describe('cenário de aceite', () => {
    it('Produção 20 → Venda 2 → Perda 1 → Ajuste +3 resulta em saldo 20', async () => {
      await registrar('PRODUCTION', 20);
      await expect(saldo()).resolves.toBe(20);

      await registrar('DIRECT_SALE', 2);
      await expect(saldo()).resolves.toBe(18);

      await registrar('LOSS', 1);
      await expect(saldo()).resolves.toBe(17);

      await registrar('ADJUSTMENT', 3);
      await expect(saldo()).resolves.toBe(20);
    });

    it('mantém todo o histórico registrado', async () => {
      await registrar('PRODUCTION', 20);
      await registrar('DIRECT_SALE', 2);
      await registrar('LOSS', 1);
      await registrar('ADJUSTMENT', 3);

      const historico = await listStockMovements(movements, variants, variantId);

      expect(historico).toHaveLength(4);
      expect(movements.items).toHaveLength(4);
    });
  });

  describe('getCurrentStock', () => {
    it('devolve zero quando não há movimentação', async () => {
      await expect(saldo()).resolves.toBe(0);
    });

    it('permite saldo negativo, que sinaliza movimentação não registrada', async () => {
      await registrar('DIRECT_SALE', 3);

      await expect(saldo()).resolves.toBe(-3);
    });

    it('falha quando a variante não existe', async () => {
      await expect(getCurrentStock(movements, variants, 'inexistente')).rejects.toBeInstanceOf(
        VariantNotFoundError,
      );
    });
  });

  describe('listStockMovements', () => {
    it('ordena do mais recente para o mais antigo', async () => {
      await registrar('PRODUCTION', 20);
      await registrar('DIRECT_SALE', 2);
      await registrar('LOSS', 1);

      const historico = await listStockMovements(movements, variants, variantId);

      expect(historico.map((item) => item.movementType.code)).toEqual([
        'LOSS',
        'DIRECT_SALE',
        'PRODUCTION',
      ]);
    });

    it('falha quando a variante não existe', async () => {
      await expect(listStockMovements(movements, variants, 'inexistente')).rejects.toBeInstanceOf(
        VariantNotFoundError,
      );
    });
  });

  describe('createStockMovement', () => {
    it('falha quando a variante não existe', async () => {
      await expect(
        createStockMovement(movements, movementTypes, variants, {
          variantId: 'inexistente',
          movementTypeId: movementTypeByCode('PRODUCTION').id,
          quantity: 1,
        }),
      ).rejects.toBeInstanceOf(VariantNotFoundError);
    });

    it('falha quando o tipo de movimentação não existe', async () => {
      await expect(
        createStockMovement(movements, movementTypes, variants, {
          variantId,
          movementTypeId: '00000000-0000-4000-8000-000000000000',
          quantity: 1,
        }),
      ).rejects.toBeInstanceOf(StockMovementTypeNotFoundError);
    });
  });
});
