# CLAUDE.md

Instruções para o Claude Code trabalhar neste repositório. Vale em qualquer
máquina a partir do clone.

## O que é o Pegs Ops

Plataforma de gestão operacional para manufatura digital, com foco em impressão
3D. Não é dashboard nem ERP: existe para dizer ao operador **o que precisa da
atenção dele agora**.

`VISION.md` e `DECISIONS.md` (D-001…D-015, com índice por tema) são a fonte da
verdade do produto. O `README.md` ainda descreve o projeto como "bootstrap" —
está desatualizado, ignore esse trecho.

## Antes de começar qualquer trabalho

Ler `README.md`, `VISION.md` e `DECISIONS.md`, e usar de fato o que está lá: as
decisões registradas restringem o que pode ser feito. Documentação de apoio em
`.ai/` (domínio, arquitetura, glossário, padrões de código) e em `docs/`.

## Espinha dorsal do domínio

`Product → Variant → Recipe → RecipeVersion`. A **Variante é o centro da operação
de fabricação** e tem tela própria em `/variants/:id`.

Invariantes que se repetem em todo módulo novo:

- **Nada é apagado.** Arquivamento é sempre lógico.
- **Nada calculado é persistido.** O saldo de estoque é a soma das movimentações;
  o planejamento do evento e a Central de Trabalho inteira são calculados na
  consulta.
- **A Central de Trabalho é a tela inicial e só observa.** Ela consulta os
  módulos, nunca é dona do dado.

Três regras de negócio vivem hoje apenas como comentário no domínio, não em
`DECISIONS.md` — não removê-las nem tratá-las como detalhe de apresentação:
alocação sequencial de estoque entre eventos (consumido em ordem de data),
"Concluídas Hoje" como seção global da Central, e a produção parcial aparecendo
lá.

## Como o trabalho chega

Em **Work Orders** (`WO-000X` ou "Feature 00X"), com estrutura fixa: branch
nomeada, objetivo, escopo, modelo, regras, fora do escopo, critério de aceite,
qualidade e commit sugerido.

O que a WO cobra e deve ser cumprido sem precisar ser lembrado:

1. A leitura obrigatória acima.
2. **Respeitar o padrão arquitetural existente**, sem refatorar fora do escopo.
3. **Parar e reportar** diante de inconsistência de domínio.
4. Rodar `pnpm lint`, `pnpm format`, `pnpm test` e `pnpm build`.
5. **Validar o critério de aceite contra a API real** (curl), mostrando os
   números obtidos — não só os testes verdes.
6. **Responder as perguntas finais antes do commit:** todos os testes passaram?
   houve decisão arquitetural diferente? alguma simplificação? algum débito
   técnico criado? houve alteração fora do módulo (justificar)?

A entrega é avaliada por esse relatório, não só pelo código. Débito técnico
declarado e alteração fora do módulo justificada valem mais do que uma entrega
que finge estar limpa.

## Quando o domínio estiver ambíguo

**Parar antes de codar e perguntar**, com opções concretas e preview do efeito de
cada escolha. Diego quase nunca escolhe uma das opções: ele escreve a regra
completa, normalmente mais precisa do que as alternativas oferecidas. Implementar
exatamente o que ele escreveu, inclusive registrando a regra em comentário no
domínio quando ele pedir.

Perguntar cedo — antes de escrever código que dependa da resposta — e no máximo
uma ou duas perguntas por vez.

## O que é decisão dele, não sua

- **O que vira decisão registrada.** Entradas no `DECISIONS.md` só entram quando
  ele mandar explicitamente; sem isso, a regra fica como comentário no domínio.
- **A numeração das decisões.** Ele às vezes sugere um número já ocupado. Manter
  a sequência real do arquivo e avisar.

## Git

**Branch sempre a partir da `main` atualizada:** `git switch main`,
`git fetch origin`, `git merge --ff-only origin/main`, e só então criar a branch.
Nunca criar uma feature a partir de outra branch de feature, mesmo quando a nova
depende de código ainda não mergeado — nesse caso, dizer isso a ele e perguntar.

**Antes do commit:** mostrar exatamente o que entra (`git status --short` +
`git diff --cached --stat`). **Depois do commit: perguntar se é para subir para o
`origin`.** Nunca fazer push por conta própria, salvo se ele já tiver pedido o
push explicitamente.

**Nunca commitar `.claude/`** — as permissões locais são específicas da máquina e
não devem ser versionadas.

**Ciclo de entrega:**

1. Gerar o diff em `tmp/feature-<nome>.diff` com `git diff main...<branch>`
   (`tmp/` é ignorado). Ele pede isso quase sempre.
2. Push só quando autorizado.
3. **Não usar `gh` CLI.** Escrever o texto do PR em `tmp/pr-<nome>.md` e entregar
   a URL `https://github.com/DiegoPegs/pegs-ops/pull/new/<branch>`. Ele abre e
   mergeia.
4. Depois do merge, sincronizar a `main` e apagar a branch local **e remota** —
   ele mantém só a `main` nos dois lados.

O texto do PR deve conter: o que muda por camada, decisões registradas, tabela de
qualidade, o critério de aceite com os números reais da validação, e uma seção de
pontos de atenção com débitos e alterações fora do módulo.

## Estado em 2026-08-12

Verificar contra o repositório antes de afirmar qualquer coisa disto como atual.

Mergeado na `main` — 8 PRs, Sprints 1 e 2: Product · Variant · Recipe (com
versionamento) · Inventory (saldo derivado) · Event Planning · Central de
Trabalho · Atividades Manuais · Registro rápido de produção. **163 testes, 15
decisões registradas.**

**Aguardando merge:** `feature/event-closing` (WO-0009, commit `c3a55d8`, 1
commit à frente da `main`) — encerramento de evento gerando venda direta.

Pendências combinadas e ainda não feitas:

- **Atomicidade do encerramento de evento** — as vendas são gravadas uma a uma
  antes da mudança de status. Exige transação na porta do repositório e atravessa
  Inventory e Event; merece WO própria. É o débito mais relevante em aberto.
- `PATCH /events/:id` ainda permite pular o encerramento e marcar `DONE` direto;
  o seletor de status continua na tela ao lado do botão novo.
- `ROADMAP.md` marca Operations e Event Closing como pendentes, mas os dois já
  foram feitos.
- `README.md` ainda diz "bootstrap, sem nenhuma regra de negócio implementada".
