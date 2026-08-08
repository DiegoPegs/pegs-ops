'use client';

import Link from 'next/link';
import { use } from 'react';

import { useProduct } from '@/features/products/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="break-words whitespace-pre-wrap">{value ?? '—'}</p>
    </div>
  );
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isPending, isError, error } = useProduct(id);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <Link href="/products" className="text-muted-foreground text-sm hover:underline">
          ← Produtos
        </Link>
      </header>

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {product && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <Badge variant={product.archivedAt ? 'secondary' : 'default'}>
                {product.archivedAt ? 'Arquivado' : 'Ativo'}
              </Badge>
            </div>
            <Button asChild>
              <Link href={`/products/${product.id}/edit`}>Editar</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Descrição" value={product.description} />
            <Field label="Tipo da origem" value={product.sourceType} />
            <Field label="URL da origem" value={product.sourceUrl} />
            <Field label="Observações" value={product.notes} />
            <Field label="Criado em" value={new Date(product.createdAt).toLocaleString('pt-BR')} />
            {product.archivedAt && (
              <Field
                label="Arquivado em"
                value={new Date(product.archivedAt).toLocaleString('pt-BR')}
              />
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
