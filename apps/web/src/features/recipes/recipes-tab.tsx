'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useArchiveRecipe,
  useCreateRecipe,
  useRecipes,
  useUpdateRecipe,
} from '@/features/recipes/api';
import { RecipeForm } from '@/features/recipes/recipe-form';
import { RecipeVersions } from '@/features/recipes/recipe-versions';

export function RecipesTab({ variantId }: { variantId: string }) {
  const { data: recipes, isPending, isError, error } = useRecipes(variantId);
  const createRecipe = useCreateRecipe(variantId);
  const updateRecipe = useUpdateRecipe(variantId);
  const archiveRecipe = useArchiveRecipe(variantId);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Cada receita é uma estratégia de fabricação de uma unidade desta variante.
        </p>
        {!creating && <Button onClick={() => setCreating(true)}>Nova receita</Button>}
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova receita</CardTitle>
          </CardHeader>
          <CardContent>
            <RecipeForm
              submitLabel="Salvar"
              pending={createRecipe.isPending}
              errorMessage={createRecipe.error?.message}
              onCancel={() => setCreating(false)}
              onSubmit={(values) =>
                createRecipe.mutate(values, { onSuccess: () => setCreating(false) })
              }
            />
          </CardContent>
        </Card>
      )}

      {isPending && <p className="text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-destructive">{error.message}</p>}

      {recipes && recipes.length === 0 && !creating && (
        <p className="text-muted-foreground">Nenhuma receita cadastrada ainda.</p>
      )}

      {recipes?.map((recipe) => (
        <Card key={recipe.id}>
          <CardContent className="space-y-4 pt-6">
            {editingId === recipe.id ? (
              <RecipeForm
                recipe={recipe}
                submitLabel="Salvar alterações"
                pending={updateRecipe.isPending}
                errorMessage={updateRecipe.error?.message}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) =>
                  updateRecipe.mutate(
                    { id: recipe.id, input: values },
                    { onSuccess: () => setEditingId(null) },
                  )
                }
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">{recipe.name}</p>
                  {recipe.description && (
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {recipe.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(recipe.id)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={archiveRecipe.isPending}
                    onClick={() => {
                      if (confirm(`Arquivar a receita "${recipe.name}"?`)) {
                        archiveRecipe.mutate(recipe.id);
                      }
                    }}
                  >
                    Arquivar
                  </Button>
                </div>
              </div>
            )}

            <RecipeVersions recipeId={recipe.id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
