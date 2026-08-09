'use client';

import type { StockMovementTypeDto } from '@pegs-ops/shared';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateStockMovement } from '@/features/inventory/api';

interface MovementDialogProps {
  variantId: string;
  movementType: StockMovementTypeDto | null;
  onClose: () => void;
}

/**
 * A quantidade é sempre informada positiva; o sinal vem da direção do tipo.
 * Só o Ajuste (BOTH) aceita valores negativos.
 *
 * O componente é remontado a cada abertura (via `key` no chamador), o que já
 * devolve os campos ao estado inicial sem precisar de efeito de limpeza.
 */
export function MovementDialog({ variantId, movementType, onClose }: MovementDialogProps) {
  const createMovement = useCreateStockMovement(variantId);
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');

  const isAdjustment = movementType?.direction === 'BOTH';
  const isSale = movementType?.code === 'DIRECT_SALE';

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!movementType) return;

    createMovement.mutate(
      {
        variantId,
        movementTypeId: movementType.id,
        quantity: Number(quantity),
        unitPrice: unitPrice === '' ? null : Number(unitPrice),
        notes: notes.trim() === '' ? null : notes.trim(),
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open={movementType !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{movementType?.name}</DialogTitle>
            <DialogDescription>
              {isAdjustment
                ? 'Use valores negativos para reduzir o estoque.'
                : 'Informe a quantidade em unidades; o sentido vem do tipo da movimentação.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              step={1}
              min={isAdjustment ? undefined : 1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              autoFocus
            />
          </div>

          {isSale && (
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Valor unitário (R$)</Label>
              <Input
                id="unitPrice"
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="movement-notes">Observação</Label>
            <Textarea
              id="movement-notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {createMovement.error && (
            <p className="text-destructive text-sm">{createMovement.error.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMovement.isPending}>
              {createMovement.isPending ? 'Registrando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
