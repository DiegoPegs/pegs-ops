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

---

## D-007 · O Pegs Ops referencia arquivos, não os gerencia (no MVP)

**Data:** 2026-08-08 · **Status:** Aceita

Durante o MVP, arquivos STL, 3MF e GCode são referenciados por URL quando
necessário. O sistema não faz upload, armazenamento, versionamento nem preview
desses arquivos. O gerenciamento de arquivos será um módulo futuro.

**Por quê:** o objetivo do sistema é controlar a operação, não ser um repositório
de arquivos. Referenciar por URL entrega o valor operacional — saber onde está o
modelo — sem exigir storage, cotas e versionamento logo de início, e sem
bloquear a evolução do restante do sistema.

---

## D-008 · O custo da Receita é manual no MVP

**Data:** 2026-08-09 · **Status:** Aceita

A Receita armazena um custo informado pelo usuário. O cálculo automático a partir
de tempo de impressão, impressora e consumo de filamento fica para uma fase
futura, quando passará a conviver com o custo informado em vez de substituí-lo.

**Por quê:** o custo informado já resolve a decisão do dia a dia — quanto cobrar
— e depende apenas do que o operador já sabe. O cálculo automático exige
modelar impressoras, materiais e tempos, e prendê-lo como pré-requisito
atrasaria a Receita inteira. Guardar os dois lado a lado depois permite comparar
o informado com o calculado e calibrar a operação.

---

## D-009 · A Variante é uma entidade navegável

**Data:** 2026-08-09 · **Status:** Implementada

A Variante continua sendo criada e listada dentro do Produto, mas cada card tem
uma ação **Abrir** que leva a `/variants/:id`. Essa página é o lugar das
funcionalidades de fabricação — hoje Receitas; adiante Estoque, Custos, Produção
e Histórico.

**Por quê:** a Variante é o centro da operação de fabricação, e empilhar tudo na
tela do Produto a sobrecarregaria a cada novo módulo. Dar tela própria à Variante
mantém o Produto como visão comercial e cria um lugar previsível para o que vem.

---

## D-010 · O número da versão da Receita é sequencial e imutável

**Data:** 2026-08-09 · **Status:** Implementada

O campo `version` é atribuído pelo sistema, sequencial por Receita (1, 2, 3…). O
usuário não informa esse valor. Versões não são renumeradas nem têm seus números
reaproveitados: arquivar a v2 não libera o número 2, e a próxima versão será a
v3.

Apenas uma versão por Receita é a padrão. Ao marcar uma nova como padrão, a
anterior deixa de ser, na mesma transação. A primeira versão de uma Receita nasce
como padrão.

**Por quê:** as versões são um histórico de evolução da fabricação. Um número
reaproveitado faria duas configurações diferentes responderem pelo mesmo nome,
quebrando qualquer referência futura — de uma ordem de produção a um registro de
custo.
