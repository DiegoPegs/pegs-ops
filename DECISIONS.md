# Decisões

Registro cronológico das decisões consolidadas do Pegs Ops. Documento vivo:
novas decisões são acrescentadas ao final, e decisões revistas ganham uma nova
entrada em vez de reescrever a anterior.

Status possíveis: **Aceita** (vale a partir de agora) · **Implementada** (já
refletida no código) · **Revista** (substituída por uma decisão posterior).

---

## D-001 · Produto não possui estoque

**Data:** 2026-08-07 · **Status:** Implementada

O `Product` não carrega quantidade, saldo ou movimentação. Estoque será um
conceito próprio, ligado à Variante, e não um atributo do produto.

**Por quê:** um produto pode existir em várias formas (tamanhos, cores,
materiais), e cada uma tem saldo próprio. Guardar estoque no produto obrigaria a
reescrever o modelo assim que as variantes entrassem.

---

## D-002 · Arquivamento é lógico, nunca exclusão física

**Data:** 2026-08-07 · **Status:** Implementada

`DELETE /products/:id` preenche `archived_at` e preserva o registro. A listagem
esconde arquivados por padrão; `?includeArchived=true` os inclui.

**Por quê:** produtos participam de histórico de produção, vendas e eventos.
Apagar o registro romperia esse histórico. Arquivar tira o item da operação do
dia a dia sem perder o passado.

---

## D-003 · Origin é entidade, não texto livre

**Data:** 2026-08-08 · **Status:** Implementada

A origem do modelo (MakerWorld, Printables, STLFlix, Patreon, Cliente, Próprio)
é uma tabela própria referenciada por `Product.originId`, e não mais um campo de
texto `sourceType`.

**Por quê:** texto livre gera grafias divergentes para a mesma origem e
inviabiliza agrupar, filtrar e medir de onde vêm os produtos. Como entidade, a
lista é controlada e pode ganhar atributos próprios (URL base, tipo de licença,
custo de assinatura) sem migrar dados soltos.

---

## D-004 · Receita pertence à Variante

**Data:** 2026-08-08 · **Status:** Aceita — ainda não implementada

A receita (o que é preciso para produzir) será vinculada à Variante, não ao
Produto.

**Por quê:** duas variantes do mesmo produto consomem filamento, tempo de
impressão e insumos diferentes. Uma receita no nível do produto não conseguiria
representar esse custo real.

---

## D-005 · Cadastro incremental

**Data:** 2026-08-08 · **Status:** Aceita

Só o nome é obrigatório no cadastro de um produto. Todo o resto — descrição,
origem, URL, observações — pode ser preenchido depois, aos poucos.

**Por quê:** o operador cadastra no meio da rotina, muitas vezes sem ter todos os
dados em mãos. Um formulário exigente empurra o registro para depois, e o que
fica para depois não é registrado.

---

## D-006 · Os atributos das Variantes são livres

**Data:** 2026-08-08 · **Status:** Implementada

Cada Variante armazena seus atributos como pares abertos de `name` e `value`
(Modelo = Gato, Cor = Branco). Não existem campos fixos como `color`, `model` ou
`material`, nem as tabelas `AttributeDefinition` e `AttributeOption`.

**Por quê:** o sistema ainda não tem um módulo de Administração para gerenciar
atributos, e fixar colunas agora congelaria um vocabulário que ainda não
conhecemos. Com pares livres, o operador cadastra o que a variante realmente
tem, e a estrutura pode evoluir para atributos normalizados sem alterar o
domínio do Produto.
