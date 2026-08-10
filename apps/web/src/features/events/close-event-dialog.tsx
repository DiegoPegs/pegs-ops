'use client';

import type { EventItemPlanningDto } from '@pegs-ops/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { eventKeys } from '@/features/events/api';
import { describeVariant } from '@/features/events/variant-search';
import { apiFetch } from '@/lib/api';

interface ClosingRow {
  taken: string;
  returned: string;
}

function useCloseEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { itemId: string; takenQuantity: number; returnedQuantity: number }[]) =>
      apiFetch(`/events/${eventId}/close`, { method: 'POST', body: JSON.stringify({ items }) }),
    // O evento sai de PLANNED e deixa de gerar produção pendente: a Central
    // e o planejamento precisam refletir isso na hora.
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['work-center'] }),
      ]);
    },
  });
}

interface CloseEventDialogProps {
  eventId: string;
  eventName: string;
  items: EventItemPlanningDto[];
  onClose: () => void;
}

export function CloseEventDialog({ eventId, eventName, items, onClose }: CloseEventDialogProps) {
  const closeEvent = useCloseEvent(eventId);

  // "Levada" nasce com a Meta planejada: é o caso comum, e o operador ajusta.
  const [rows, setRows] = useState<Record<string, ClosingRow>>(() =>
    Object.fromEntries(
      items.map((item) => [item.itemId, { taken: String(item.targetQuantity), returned: '0' }]),
    ),
  );

  function update(itemId: string, field: keyof ClosingRow, value: string) {
    setRows((current) => ({
      ...current,
      [itemId]: { ...current[itemId]!, ...{ [field]: value } },
    }));
  }

  function soldOf(itemId: string): number {
    const row = rows[itemId];

    return Number(row?.taken || 0) - Number(row?.returned || 0);
  }

  const invalido = items.some((item) => soldOf(item.itemId) < 0);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (invalido) return;

    closeEvent.mutate(
      items.map((item) => ({
        itemId: item.itemId,
        takenQuantity: Number(rows[item.itemId]?.taken || 0),
        returnedQuantity: Number(rows[item.itemId]?.returned || 0),
      })),
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Encerrar evento</DialogTitle>
            <DialogDescription>
              {eventName} · o que não voltou é registrado como venda direta.
            </DialogDescription>
          </DialogHeader>

          {items.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Este evento não tem itens planejados. Encerrar apenas muda o status para realizado.
            </p>
          )}

          <div className="space-y-4">
            {items.map((item) => {
              const sold = soldOf(item.itemId);

              return (
                <div key={item.itemId} className="space-y-2 rounded-md border p-3">
                  <p className="text-sm font-medium">
                    {item.productName}{' '}
                    <span className="text-muted-foreground">
                      {describeVariant({
                        attributes: item.variantAttributes,
                        sku: item.variantSku,
                      })}
                    </span>
                  </p>

                  <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Planejado</Label>
                      <p className="text-sm">{item.targetQuantity}</p>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`taken-${item.itemId}`} className="text-xs">
                        Levada
                      </Label>
                      <Input
                        id={`taken-${item.itemId}`}
                        type="number"
                        min={0}
                        step={1}
                        value={rows[item.itemId]?.taken ?? ''}
                        onChange={(event) => update(item.itemId, 'taken', event.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`returned-${item.itemId}`} className="text-xs">
                        Retornada
                      </Label>
                      <Input
                        id={`returned-${item.itemId}`}
                        type="number"
                        min={0}
                        step={1}
                        value={rows[item.itemId]?.returned ?? ''}
                        onChange={(event) => update(item.itemId, 'returned', event.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Vendida</Label>
                      <p className={`text-sm font-medium ${sold < 0 ? 'text-destructive' : ''}`}>
                        {sold < 0 ? 'inválido' : sold}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {invalido && (
            <p className="text-destructive text-sm">
              A quantidade retornada não pode ser maior que a levada.
            </p>
          )}
          {closeEvent.error && (
            <p className="text-destructive text-sm">{closeEvent.error.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={closeEvent.isPending || invalido}>
              {closeEvent.isPending ? 'Encerrando…' : 'Encerrar evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
