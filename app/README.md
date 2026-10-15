# Lançamento rápido (P1)

Implementação em React + Vite + TypeScript da tela **P1 · Lançamento rápido**
(`../design/project/P1 Lancamento Rapido.dc.html`), com as cores e regras do
**Sistema Visual v2** (`../design/project/Sistema Visual v2.dc.html`).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # testes da digitação, do orçamento e do rascunho
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

## Estrutura

- `src/styles/tokens.css`: tokens da seção 12 do Sistema Visual v2, copiados sem alteração.
- `src/data/reference.ts`: Dados de referência de 14/10 (antes do lançamento).
- `src/lib/money.ts`: formatação em reais, sinal `−` (U+2212) e digitação tipo caixa eletrônico.
- `src/lib/budget.ts`: estados ok/alerta/estouro e a geometria da barra (100% a 2/3, teto em 150%).
- `src/features/quick-entry/`: o bottom sheet; `draft.ts` tem toda a regra (sugestão de conta, Pagar fatura, validação).
- `src/features/home/`: a Início por trás do sheet (frame C).
- `src/state/ledger.ts`: lançamentos da sessão e os saldos derivados (sem backend).

## Comportamento

- Fluxo de 3 toques: digitar → categoria → Salvar. Categoria com envelopes já
  pré-seleciona a última subcategoria usada (Supermercado), então dá para salvar
  direto da tela de subcategorias.
- A conta vem da subcategoria (Supermercado → VA, Restaurantes → Cartão Panty)
  até a pessoa escolher outra no chip.
- Chips: Hoje/Ontem, conta, Casa/Pessoal e "+ Mais" (descrição, comprovante,
  parcelado, repetir todo mês, "Meu dinheiro livre", que deixa o lançamento privado).
- Fechar com valor digitado (✕, Esc, toque fora ou arrastar a faixa superior
  mais de 120px) pede "Descartar?". Sem valor, fecha direto.
- Teclado físico: dígitos, Backspace, Enter salva, Esc volta/fecha.
- "Pagar" no Seguro do carro abre o sheet preenchido; ao salvar, a conta some da lista.
- "Reduzir movimento": o sheet e o toast só fazem fade curto e a barra não anima (tokens do v2).
