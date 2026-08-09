'use client';

import type { StockMovementTypeDto } from '@pegs-ops/shared';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStock, useStockMovements, useStockMovementTypes } from '@/features/inventory/api';
import { MovementDialog } from '@/features/inventory/movement-dialog';

/** Ordem das ações rápidas, conforme a operação do dia a dia. */
const QUICK_ACTIONS = ['PRODUCTION', 'DIRECT_SALE', 'ADJUSTMENT', 'LOSS'];

function formatPrice(price: number | null): string {
  if (price === null) return '—';

  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function InventoryTab({ variantId }: { variantId: string }) {
  const { data: stock, isPending: loadingStock } = useStock(variantId);
  const { data: movements, isPending, isError, error } = useStockMovements(variantId);
  const { data: types } = useStockMovementTypes();

  const [openType, setOpenType] = useState<StockMovementTypeDto | null>(null);

  const quickActions = QUICK_ACTIONS.map((code) =>
    types?.find((type) => type.code === code),
  ).filter((type): type is StockMovementTypeDto => type !== undefined);

  const balance = stock?.balance ?? 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-muted-foreground text-sm">Saldo atual</p>
            <p
              className={`text-3xl font-semibold ${balance < 0 ? 'text-destructive' : ''}`}
              aria-live="polite"
            >
              {loadingStock ? '…' : balance}
            </p>
            {balance < 0 && (
              <p className="text-destructive text-sm">
                Saldo negativo: há movimentação anterior ainda não registrada.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((type) => (
              <Button key={type.id} variant="outline" onClick={() => setOpenType(type)}>
                + {type.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-medium">Histórico de movimentações</p>

        {isPending && <p className="text-muted-foreground text-sm">Carregando…</p>}
        {isError && <p className="text-destructive text-sm">{error.message}</p>}

        {movements && movements.length === 0 && (
          <p className="text-muted-foreground text-sm">Nenhuma movimentação registrada ainda.</p>
        )}

        {movements && movements.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor unitário</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(movement.createdAt).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{movement.movementType.name}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      movement.quantity < 0 ? 'text-destructive' : ''
                    }`}
                  >
                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {formatPrice(movement.unitPrice)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{movement.notes ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <MovementDialog
        key={openType?.id ?? 'closed'}
        variantId={variantId}
        movementType={openType}
        onClose={() => setOpenType(null)}
      />
    </div>
  );
}
