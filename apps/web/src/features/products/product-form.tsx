'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProductSchema,
  type CreateProductInput,
  type ProductDto,
  type ProductFormValues,
} from '@pegs-ops/shared';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProductFormProps {
  product?: ProductDto;
  submitLabel: string;
  pending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateProductInput) => void;
}

export function ProductForm({
  product,
  submitLabel,
  pending,
  errorMessage,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      sourceType: product?.sourceType ?? '',
      sourceUrl: product?.sourceUrl ?? '',
      notes: product?.notes ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register('name')} aria-invalid={Boolean(errors.name)} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sourceType">Tipo da origem</Label>
          <Input
            id="sourceType"
            placeholder="Modelagem própria, marketplace…"
            {...register('sourceType')}
          />
          {errors.sourceType && (
            <p className="text-destructive text-sm">{errors.sourceType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceUrl">URL da origem</Label>
          <Input id="sourceUrl" placeholder="https://…" {...register('sourceUrl')} />
          {errors.sourceUrl && (
            <p className="text-destructive text-sm">{errors.sourceUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" rows={3} {...register('notes')} />
        {errors.notes && <p className="text-destructive text-sm">{errors.notes.message}</p>}
      </div>

      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={product ? `/products/${product.id}` : '/products'}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
