# Nosso Caixa: app

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4. Por enquanto tem a tela
**P1 · Lançamento rápido** (`../design/project/P1 Lancamento Rapido.dc.html`), com
as cores e regras do **Sistema Visual v2** (`../design/project/Sistema Visual v2.dc.html`).
Ainda sem backend: os lançamentos ficam só na memória da página.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # testes da digitação, do orçamento e do rascunho
npm run lint
npm run build
```

No desktop o app aparece num aparelho de 390×844 com um seletor dos frames do
design; no celular ocupa a tela inteira. `?frame=A` … `?frame=E` abre direto no
estado de cada frame:

| Frame | Estado |
| --- | --- |
| A | R$ 87,40 digitado, Alimentação › Supermercado, conta VA sugerida |
| B | Subcategorias de Alimentação com o quanto resta; Delivery estourado |
| C | Salvo: Início atualizada e toast com Desfazer (fixo na demo) |
| D | Transferência "Pagar fatura": Conta Vini → Cartão Vini, R$ 1.926,80 |
| E | Arrastado para baixo com valor: "Descartar R$ 87,40?" |

## Estilo: tokens + Tailwind

- `src/styles/tokens.css` é a seção 12 do Sistema Visual v2, **copiada sem alteração**.
  Ela define as cores do claro, do escuro (`[data-theme="dark"]`) e as durações
  com "reduzir movimento".
- `src/app/globals.css` registra esses tokens no Tailwind com `@theme inline reference`:
  as classes (`bg-surface`, `text-text-secondary`, `rounded-card`, `shadow-card`…)
  apontam para as variáveis do `tokens.css`, sem copiar valores. Trocar o tema troca tudo.
- Cores das categorias: `var(--cat-<id>-icon)` e `var(--cat-<id>-bg)` (veja `CategoryBadge`).
- Variantes próprias: `short:` (altura ≤ 760px, teclado de 48px) e `phone:` (tela cheia).
- O tema é aplicado antes da pintura por um script no `<head>` (`src/lib/theme.ts`).

## Estrutura

- `src/app/`: layout (fontes, tema) e a página.
- `src/data/reference.ts`: Dados de referência de 14/10 (antes do lançamento), iguais a `docs/06`.
- `src/lib/money.ts`: reais, sinal `−` (U+2212) e digitação tipo caixa eletrônico.
- `src/lib/budget.ts`: ok/alerta/estouro e a geometria da barra (100% a 2/3, teto em 150%).
- `src/state/ledger.ts`: lançamentos e saldos derivados (funções puras); `useLedger.ts` é o hook.
- `src/features/quick-entry/`: o bottom sheet. `draft.ts` tem a regra (sugestão de conta,
  Pagar fatura, validação); `ui.ts` reúne as classes repetidas.
- `src/features/home/`: a Início por trás do sheet.
- `src/features/prototype/`: a moldura de aparelho e os estados A–E.

## Comportamento

- Fluxo de 3 toques: digitar → categoria → Salvar. Categoria com envelopes já
  pré-seleciona a última subcategoria usada (Supermercado).
- A conta vem da subcategoria (Supermercado → VA, Restaurantes → Cartão Panty)
  até a pessoa escolher outra no chip.
- Chips: Hoje/Ontem, conta, Casa/Pessoal e "+ Mais" (descrição, comprovante,
  parcelado, repetir todo mês, "Meu dinheiro livre", que deixa o lançamento privado).
- Fechar com valor digitado (✕, Esc, toque fora ou arrastar a faixa superior
  mais de 120px) pede "Descartar?". Sem valor, fecha direto.
- Teclado físico: dígitos, Backspace, Enter salva, Esc volta/fecha.
- "Pagar" no Seguro do carro abre o sheet preenchido; ao salvar, a conta some da lista.
