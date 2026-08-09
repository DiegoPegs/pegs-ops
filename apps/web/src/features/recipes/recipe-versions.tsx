'use client';

import type { RecipeVersionDto } from '@pegs-ops/shared';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useArchiveRecipeVersion,
  useCreateRecipeVersion,
  useRecipeVersions,
  useUpdateRecipeVersion,
} from '@/features/recipes/api';
import { RecipeVersionForm } from '@/features/recipes/recipe-version-form';

/** 225 minutos → "3h 45min". A conversão vive só na interface. */
function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '—';

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}min`;
  if (rest === 0) return `${hours}h`;

  return `${hours}h ${rest}min`;
}

function formatCost(cost: number | null): string {
  if (cost === null) return '—';

  return cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function VersionSummary({ version }: { version: RecipeVersionDto }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">v{version.version}</span>
        {version.isDefault && <Badge>Padrão</Badge>}
      </div>
      <p className="text-muted-foreground">
        {version.printerName ?? '—'} · {formatMinutes(version.estimatedPrintTimeMinutes)} ·{' '}
        {version.estimatedFilamentGrams ?? '—'} g · {version.material ?? '—'} ·{' '}
        {formatCost(version.estimatedCost)}
      </p>
      {version.modelSourceUrl && (
        <a
          href={version.modelSourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground break-all underline"
        >
          {version.modelSourceUrl}
        </a>
      )}
      {version.notes && (
        <p className="text-muted-foreground whitespace-pre-wrap">{version.notes}</p>
      )}
    </div>
  );
}

export function RecipeVersions({ recipeId }: { recipeId: string }) {
  const { data: versions, isPending, isError, error } = useRecipeVersions(recipeId);
  const createVersion = useCreateRecipeVersion(recipeId);
  const updateVersion = useUpdateRecipeVersion(recipeId);
  const archiveVersion = useArchiveRecipeVersion(recipeId);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">Versões</p>
        {!creating && (
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            Nova versão
          </Button>
        )}
      </div>

      {creating && (
        <div className="bg-muted/40 rounded-md p-4">
          <RecipeVersionForm
            submitLabel="Salvar versão"
            pending={createVersion.isPending}
            errorMessage={createVersion.error?.message}
            onCancel={() => setCreating(false)}
            onSubmit={(values) =>
              createVersion.mutate(values, { onSuccess: () => setCreating(false) })
            }
          />
        </div>
      )}

      {isPending && <p className="text-muted-foreground text-sm">Carregando…</p>}
      {isError && <p className="text-destructive text-sm">{error.message}</p>}

      {versions && versions.length === 0 && !creating && (
        <p className="text-muted-foreground text-sm">Nenhuma versão cadastrada ainda.</p>
      )}

      {versions?.map((version) =>
        editingId === version.id ? (
          <div key={version.id} className="bg-muted/40 rounded-md p-4">
            <RecipeVersionForm
              version={version}
              submitLabel="Salvar alterações"
              pending={updateVersion.isPending}
              errorMessage={updateVersion.error?.message}
              onCancel={() => setEditingId(null)}
              onSubmit={(values) =>
                updateVersion.mutate(
                  { id: version.id, input: values },
                  { onSuccess: () => setEditingId(null) },
                )
              }
            />
          </div>
        ) : (
          <div
            key={version.id}
            className="flex items-start justify-between gap-4 rounded-md border p-3"
          >
            <VersionSummary version={version} />
            <div className="flex shrink-0 gap-1">
              {!version.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={updateVersion.isPending}
                  onClick={() =>
                    updateVersion.mutate({ id: version.id, input: { isDefault: true } })
                  }
                >
                  Tornar padrão
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setEditingId(version.id)}>
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={archiveVersion.isPending}
                onClick={() => {
                  if (confirm(`Arquivar a versão ${version.version}?`)) {
                    archiveVersion.mutate(version.id);
                  }
                }}
              >
                Arquivar
              </Button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
