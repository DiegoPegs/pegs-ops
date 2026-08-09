'use client';

import type { VariantWithProductDto } from '@pegs-ops/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

function useVariantSearch(term: string) {
  return useQuery({
    queryKey: ['variant-search', term] as const,
    queryFn: () =>
      apiFetch<VariantWithProductDto[]>(`/variants?search=${encodeURIComponent(term)}`),
    enabled: term.trim().length >= 2,
  });
}

export function describeVariant(variant: {
  attributes: { name: string; value: string }[];
  sku: string | null;
}): string {
  if (variant.attributes.length > 0) {
    return variant.attributes.map((attribute) => attribute.value).join(' · ');
  }

  return variant.sku ?? 'Variante sem atributos';
}

interface VariantSearchProps {
  pending: boolean;
  errorMessage?: string | null;
  onSelect: (variantId: string, targetQuantity: number) => void;
}

/** O operador pesquisa a variante diretamente, sem passar pelo produto. */
export function VariantSearch({ pending, errorMessage, onSelect }: VariantSearchProps) {
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<VariantWithProductDto | null>(null);
  const [target, setTarget] = useState('');
  const { data: results, isFetching } = useVariantSearch(term);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;

    onSelect(selected.id, Number(target));
    setSelected(null);
    setTerm('');
    setTarget('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="variant-search">Variante</Label>
          <Input
            id="variant-search"
            placeholder="Buscar por produto, atributo ou SKU…"
            value={selected ? `${selected.product.name} — ${describeVariant(selected)}` : term}
            onChange={(event) => {
              setSelected(null);
              setTerm(event.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">Meta</Label>
          <Input
            id="target"
            type="number"
            min={1}
            step={1}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={!selected || pending}>
          {pending ? 'Adicionando…' : 'Adicionar'}
        </Button>
      </div>

      {!selected && term.trim().length >= 2 && (
        <div className="max-h-56 divide-y overflow-y-auto rounded-md border">
          {isFetching && <p className="text-muted-foreground p-3 text-sm">Buscando…</p>}
          {!isFetching && results?.length === 0 && (
            <p className="text-muted-foreground p-3 text-sm">Nenhuma variante encontrada.</p>
          )}
          {results?.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className="hover:bg-muted/60 block w-full p-3 text-left text-sm"
              onClick={() => setSelected(variant)}
            >
              <span className="font-medium">{variant.product.name}</span>
              <span className="text-muted-foreground"> — {describeVariant(variant)}</span>
            </button>
          ))}
        </div>
      )}

      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
    </form>
  );
}
