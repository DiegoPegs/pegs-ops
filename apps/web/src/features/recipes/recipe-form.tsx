'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createRecipeSchema,
  type CreateRecipeInput,
  type RecipeDto,
  type RecipeFormValues,
} from '@pegs-ops/shared';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RecipeFormProps {
  recipe?: RecipeDto;
  submitLabel: string;
  pending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateRecipeInput) => void;
  onCancel: () => void;
}

export function RecipeForm({
  recipe,
  submitLabel,
  pending,
  errorMessage,
  onSubmit,
  onCancel,
}: RecipeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormValues, unknown, CreateRecipeInput>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      name: recipe?.name ?? '',
      description: recipe?.description ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipe-name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="recipe-name"
          placeholder="Produção, Alta Qualidade, Feira…"
          {...register('name')}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipe-description">Descrição</Label>
        <Textarea id="recipe-description" rows={2} {...register('description')} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

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
