'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createRecipeVersionSchema,
  type CreateRecipeVersionInput,
  type RecipeVersionDto,
  type RecipeVersionFormValues,
} from '@pegs-ops/shared';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/** Campo vazio vira null; o schema recebe number, nunca string ou NaN. */
const asNumberOrNull = (value: unknown) =>
  value === '' || value === null || value === undefined ? null : Number(value);

interface RecipeVersionFormProps {
  version?: RecipeVersionDto;
  submitLabel: string;
  pending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateRecipeVersionInput) => void;
  onCancel: () => void;
}

export function RecipeVersionForm({
  version,
  submitLabel,
  pending,
  errorMessage,
  onSubmit,
  onCancel,
}: RecipeVersionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeVersionFormValues, unknown, CreateRecipeVersionInput>({
    resolver: zodResolver(createRecipeVersionSchema),
    defaultValues: {
      printerName: version?.printerName ?? '',
      estimatedPrintTimeMinutes: version?.estimatedPrintTimeMinutes ?? null,
      estimatedFilamentGrams: version?.estimatedFilamentGrams ?? null,
      material: version?.material ?? '',
      estimatedCost: version?.estimatedCost ?? null,
      modelSourceUrl: version?.modelSourceUrl ?? '',
      notes: version?.notes ?? '',
      isDefault: version?.isDefault ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="printerName">Impressora</Label>
          <Input id="printerName" placeholder="Bambu Lab A1" {...register('printerName')} />
          {errors.printerName && (
            <p className="text-destructive text-sm">{errors.printerName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input id="material" placeholder="PLA Matte" {...register('material')} />
          {errors.material && <p className="text-destructive text-sm">{errors.material.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedPrintTimeMinutes">Tempo de impressão (minutos)</Label>
          <Input
            id="estimatedPrintTimeMinutes"
            type="number"
            min={1}
            step={1}
            placeholder="210"
            {...register('estimatedPrintTimeMinutes', { setValueAs: asNumberOrNull })}
          />
          {errors.estimatedPrintTimeMinutes && (
            <p className="text-destructive text-sm">{errors.estimatedPrintTimeMinutes.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedFilamentGrams">Filamento (gramas)</Label>
          <Input
            id="estimatedFilamentGrams"
            type="number"
            min={0}
            step="0.01"
            placeholder="186"
            {...register('estimatedFilamentGrams', { setValueAs: asNumberOrNull })}
          />
          {errors.estimatedFilamentGrams && (
            <p className="text-destructive text-sm">{errors.estimatedFilamentGrams.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Custo informado (R$)</Label>
          <Input
            id="estimatedCost"
            type="number"
            min={0}
            step="0.01"
            placeholder="8.40"
            {...register('estimatedCost', { setValueAs: asNumberOrNull })}
          />
          {errors.estimatedCost && (
            <p className="text-destructive text-sm">{errors.estimatedCost.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelSourceUrl">URL do modelo</Label>
          <Input
            id="modelSourceUrl"
            placeholder="https://makerworld.com/…"
            {...register('modelSourceUrl')}
          />
          {errors.modelSourceUrl && (
            <p className="text-destructive text-sm">{errors.modelSourceUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="version-notes">Observações</Label>
        <Textarea id="version-notes" rows={2} {...register('notes')} />
        {errors.notes && <p className="text-destructive text-sm">{errors.notes.message}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4" {...register('isDefault')} />
        Usar esta versão por padrão
      </label>

      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
