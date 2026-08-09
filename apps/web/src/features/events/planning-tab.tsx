'use client';

import type { EventItemPlanningDto } from '@pegs-ops/shared';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAddEventItem,
  useEventPlanning,
  useRemoveEventItem,
  useUpdateEventItem,
} from '@/features/events/api';
import { describeVariant, VariantSearch } from '@/features/events/variant-search';

/** 2775 minutos → "46h 15min". A conversão vive só na interface. */
function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '—';

  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);

  if (hours === 0) return `${rest}min`;
  if (rest === 0) return `${hours}h`;

  return `${hours}h ${rest}min`;
}

function formatGrams(grams: number | null): string {
  if (grams === null) return '—';

  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`;
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—';

  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function TargetCell({
  item,
  onSave,
  pending,
}: {
  item: EventItemPlanningDto;
  onSave: (value: number) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState(String(item.targetQuantity));

  return (
    <Input
      type="number"
      min={1}
      step={1}
      className="w-20"
      value={value}
      disabled={pending}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => {
        const parsed = Number(value);
        if (parsed !== item.targetQuantity && parsed > 0) onSave(parsed);
      }}
    />
  );
}

export function PlanningTab({ eventId }: { eventId: string }) {
  const { data: planning, isPending, isError, error } = useEventPlanning(eventId);
  const addItem = useAddEventItem(eventId);
  const updateItem = useUpdateEventItem(eventId);
  const removeItem = useRemoveEventItem(eventId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar variante</CardTitle>
        </CardHeader>
        <CardContent>
          <VariantSearch
            pending={addItem.isPending}
            errorMessage={addItem.error?.message}
            onSelect={(variantId, targetQuantity) => addItem.mutate({ variantId, targetQuantity })}
          />
        </CardContent>
      </Card>

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {planning && planning.items.length === 0 && (
        <p className="text-muted-foreground">Nenhuma variante planejada ainda.</p>
      )}

      {planning && planning.items.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variante</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Produzir</TableHead>
                <TableHead className="text-right">Tempo</TableHead>
                <TableHead className="text-right">Filamento</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {planning.items.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>
                    <Link href={`/variants/${item.variantId}`} className="hover:underline">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        —{' '}
                        {describeVariant({
                          attributes: item.variantAttributes,
                          sku: item.variantSku,
                        })}
                      </span>
                    </Link>
                    {item.setup ? (
                      <p className="text-muted-foreground text-xs">
                        {item.setup.recipeName} v{item.setup.version}
                      </p>
                    ) : (
                      <p className="text-destructive text-xs">Sem receita padrão definida</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <TargetCell
                      item={item}
                      pending={updateItem.isPending}
                      onSave={(targetQuantity) =>
                        updateItem.mutate({ id: item.itemId, input: { targetQuantity } })
                      }
                    />
                  </TableCell>
                  <TableCell
                    className={`text-right ${item.currentStock < 0 ? 'text-destructive' : ''}`}
                  >
                    {item.currentStock}
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.toProduce}</TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {formatMinutes(item.estimatedPrintTimeMinutes)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {formatGrams(item.estimatedFilamentGrams)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {formatCurrency(item.estimatedCost)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={removeItem.isPending}
                      onClick={() => removeItem.mutate(item.itemId)}
                    >
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo do evento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-5">
              <div>
                <p className="text-muted-foreground text-sm">Total planejado</p>
                <p className="text-xl font-semibold">{planning.summary.totalTarget}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total a produzir</p>
                <p className="text-xl font-semibold">{planning.summary.totalToProduce}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tempo total</p>
                <p className="text-xl font-semibold">
                  {formatMinutes(planning.summary.totalPrintTimeMinutes)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Filamento total</p>
                <p className="text-xl font-semibold">
                  {formatGrams(planning.summary.totalFilamentGrams)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Custo total</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(planning.summary.totalCost)}
                </p>
              </div>

              {planning.summary.itemsWithoutSetup > 0 && (
                <p className="text-destructive text-sm sm:col-span-5">
                  {planning.summary.itemsWithoutSetup} variante(s) sem receita padrão: tempo,
                  filamento e custo delas não entram nos totais.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
