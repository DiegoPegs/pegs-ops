'use client';

import Link from 'next/link';
import { use } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipesTab } from '@/features/recipes/recipes-tab';
import { useVariant } from '@/features/variants/variant-api';

export default function VariantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: variant, isPending, isError, error } = useVariant(id);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <header>
        <Link
          href={variant ? `/products/${variant.productId}` : '/products'}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Produto
        </Link>
      </header>

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {variant && (
        <>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">
              {variant.attributes.length > 0
                ? variant.attributes.map((attribute) => attribute.value).join(' · ')
                : 'Variante'}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={variant.archivedAt ? 'secondary' : 'default'}>
                {variant.archivedAt ? 'Arquivada' : 'Ativa'}
              </Badge>
              {variant.sku && (
                <span className="text-muted-foreground text-sm">SKU: {variant.sku}</span>
              )}
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="recipes">Receitas</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atributos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {variant.attributes.length === 0 && (
                    <p className="text-muted-foreground">Sem atributos.</p>
                  )}
                  {variant.attributes.map((attribute) => (
                    <div key={attribute.id} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground w-32 shrink-0">{attribute.name}</span>
                      <span>{attribute.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes" className="pt-4">
              <RecipesTab variantId={variant.id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}
