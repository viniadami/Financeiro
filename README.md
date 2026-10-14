# Nosso Caixa — finanças da família

App de finanças pessoais para o casal **Vini & Panty** cuidar da casa com sabedoria.

O objetivo é ver para onde vai o dinheiro, criar uma rotina de orçamento familiar baseada na renda, começar a investir e acompanhar a renda extra.

**Como vai funcionar:**
- **No celular (os dois):** lançar gastos em segundos, ou por **foto** do cupom e do comprovante de PIX.
- **No desktop:** análises, gráficos, dashboards e indicadores.

> **Status:** fase de planejamento. Ainda não há código; este repositório guarda a análise, as decisões e os prompts de design.

## Decisões já tomadas

- **App web instalável (PWA):** um único app para celular e desktop, sem loja de apps.
- **Stack prevista:** Next.js + TypeScript, Supabase (banco, login, tempo real, arquivos) e Vercel.
- **Design** no Claude Design, com os prompts em [`docs/06-prompts-de-design.md`](docs/06-prompts-de-design.md).
- **Lançamento por foto** e **cofre de comprovantes** fazem parte do escopo.

## Diagnóstico em 30 segundos (da planilha de orçamento)

| | Janeiro |
|---|---|
| Receitas | R$ 11.686,50 |
| Gastos | R$ 13.268,40 (113,5% da renda) |
| Saldo | **−R$ 1.581,90** |
| Despesas fixas | 60% da renda |
| Comer fora × supermercado | R$ 1.974 × R$ 1.420 |
| Ajuda dos pais | 29% da renda |
| Investimento | R$ 0 (mas há R$ 220/mês de poupança registrada como despesa fixa) |

## Documentação

1. [Análise das planilhas](docs/01-analise-planilhas.md): números, diagnóstico e problemas das planilhas antigas
2. [Visão do produto](docs/02-visao-do-produto.md): princípios, funcionalidades, rituais do casal, indicadores e **como começar**
3. [Lançamento por foto](docs/03-lancamento-por-foto.md): cupom, PIX, boleto, NFC-e e cofre de comprovantes
4. [Categorias e modelo de dados](docs/04-categorias-e-modelo-de-dados.md): árvore de categorias, campos e regras (cartão, parcelado, privacidade, IR)
5. [Arquitetura e roadmap](docs/05-arquitetura-e-roadmap.md): PWA, uso offline, segurança, backup e fases
6. [Design e prompts](docs/06-prompts-de-design.md): 20 prompts prontos para o Claude Design, com dados de exemplo coerentes

## Próximos passos

1. Conversa do casal: objetivos, divisão das despesas e dinheiro livre de cada um.
2. Inventário de contas, cartões, contas fixas, rendas atuais e possíveis dívidas.
3. Plano do 13º e das despesas de janeiro/fevereiro, no papel, ainda este ano.
4. Começar a registrar já, no “Registro Diário” compartilhado com as novas categorias.
5. Design das telas no Claude Design (prompts P0 a P11 primeiro).
6. Desenvolvimento do MVP (Fase 1a: lançar e ver).
