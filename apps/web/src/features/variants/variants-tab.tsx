'use client';

import type { VariantDto } from '@pegs-ops/shared';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useArchiveVariant,
  useCreateVariant,
  useUpdateVariant,
  useVariants,
} from '@/features/variants/api';
import { VariantForm } from '@/features/variants/variant-form';

function VariantSummary({ variant }: { variant: VariantDto }) {
  return (
    <div className="space-y-2">
      {variant.attributes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {variant.attributes.map((attribute) => (
            <Badge key={attribute.id} variant="secondary">
              {attribute.name}: {attribute.value}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Sem atributos.</p>
      )}
      {variant.sku && <p className="text-muted-foreground text-sm">SKU: {variant.sku}</p>}
    </div>
  );
}

export function VariantsTab({ productId }: { productId: string }) {
  const { data: variants, isPending, isError, error } = useVariants(productId);
  const createVariant = useCreateVariant(productId);
  const updateVariant = useUpdateVariant(productId);
  const archiveVariant = useArchiveVariant(productId);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Cada variante representa um item físico diferente do produto.
        </p>
        {!creating && <Button onClick={() => setCreating(true)}>Nova variante</Button>}
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova variante</CardTitle>
          </CardHeader>
          <CardContent>
            <VariantForm
              submitLabel="Salvar"
              pending={createVariant.isPending}
              errorMessage={createVariant.error?.message}
              onCancel={() => setCreating(false)}
              onSubmit={(values) =>
                createVariant.mutate(values, { onSuccess: () => setCreating(false) })
              }
            />
          </CardContent>
        </Card>
      )}

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {variants && variants.length === 0 && !creating && (
        <p className="text-muted-foreground">Nenhuma variante cadastrada ainda.</p>
      )}

      {variants?.map((variant) => (
        <Card key={variant.id}>
          <CardContent className="space-y-4 pt-6">
            {editingId === variant.id ? (
              <VariantForm
                variant={variant}
                submitLabel="Salvar alterações"
                pending={updateVariant.isPending}
                errorMessage={updateVariant.error?.message}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) =>
                  updateVariant.mutate(
                    { id: variant.id, input: values },
                    { onSuccess: () => setEditingId(null) },
                  )
                }
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <VariantSummary variant={variant} />
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(variant.id)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={archiveVariant.isPending}
                    onClick={() => {
                      if (confirm('Arquivar esta variante?')) {
                        archiveVariant.mutate(variant.id);
                      }
                    }}
                  >
                    Arquivar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
