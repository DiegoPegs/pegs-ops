'use client';

import Link from 'next/link';
import { use } from 'react';

import { useProduct } from '@/features/products/api';
import { VariantsTab } from '@/features/variants/variants-tab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <header className="space-y-1">
        <Link href="/products" className="text-muted-foreground text-sm hover:underline">
          ← Produtos
        </Link>
      </header>

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {product && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <Badge variant={product.archivedAt ? 'secondary' : 'default'}>
                {product.archivedAt ? 'Arquivado' : 'Ativo'}
              </Badge>
            </div>
            <Button asChild>
              <Link href={`/products/${product.id}/edit`}>Editar</Link>
            </Button>
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados do produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Descrição" value={product.description} />
                  <Field label="Origem" value={product.origin?.name ?? null} />
                  <Field label="URL da origem" value={product.originUrl} />
                  <Field label="Observações" value={product.notes} />
                  <Field
                    label="Criado em"
                    value={new Date(product.createdAt).toLocaleString('pt-BR')}
                  />
                  {product.archivedAt && (
                    <Field
                      label="Arquivado em"
                      value={new Date(product.archivedAt).toLocaleString('pt-BR')}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variants" className="pt-4">
              <VariantsTab productId={product.id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}
