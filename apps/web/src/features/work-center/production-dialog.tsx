'use client';

import type { PendingProductionDto } from '@pegs-ops/shared';
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
import { apiFetch } from '@/lib/api';

function useRegisterProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { variantId: string; quantity: number }) =>
      apiFetch('/productions', { method: 'POST', body: JSON.stringify(input) }),
    // A Central apenas observa o novo estado: recarregamos a consulta inteira,
    // sem recarregar a página.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['work-center'] }),
  });
}

function variantLabel(production: PendingProductionDto): string {
  if (production.variantAttributes.length > 0) {
    return production.variantAttributes.map((attribute) => attribute.value).join(' ');
  }

  return production.variantSku ?? 'Variante';
}

/** Sugestão: o que falta para a demanda mais urgente, não a necessidade total. */
export function suggestedQuantity(production: PendingProductionDto): number {
  return production.origins[0]?.quantity ?? production.toProduce;
}

interface ProductionDialogProps {
  production: PendingProductionDto;
  onClose: () => void;
}

export function ProductionDialog({ production, onClose }: ProductionDialogProps) {
  const registerProduction = useRegisterProduction();
  const [quantity, setQuantity] = useState(String(suggestedQuantity(production)));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    registerProduction.mutate(
      { variantId: production.variantId, quantity: Number(quantity) },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar produção</DialogTitle>
            <DialogDescription>
              {production.productName} {variantLabel(production)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="produced-quantity">
              Quantidade produzida <span className="text-destructive">*</span>
            </Label>
            <Input
              id="produced-quantity"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              autoFocus
            />
            <p className="text-muted-foreground text-xs">
              Necessidade total: {production.toProduce} · estoque atual: {production.currentStock}
            </p>
          </div>

          {registerProduction.error && (
            <p className="text-destructive text-sm">{registerProduction.error.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={registerProduction.isPending}>
              {registerProduction.isPending ? 'Registrando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
