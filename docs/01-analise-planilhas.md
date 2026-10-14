# Análise das planilhas

Análise das duas planilhas que a família usava (as planilhas em si não estão no repositório, por conterem dados financeiros pessoais). Todos os números foram conferidos célula por célula.

## 1.1 `PLANILHA_ORÇAMENTO_PESSOAL_2023.xlsx` (aba “dados”, ano 2024)
**Estrutura:** matriz itens × meses, com valores digitados à mão. Os blocos são Receitas → Investimentos → Despesas Fixas → Variáveis → Extras → Adicionais → Saldo, cada um com “% sobre receita”. É um **orçamento (planejado)**, não um controle do que foi gasto de fato.

**Janeiro (o mês mais completo):**
| Bloco | Valor | % da receita |
|---|---|---|
| Receitas (Salário Vini 3.500 · Salário Panty 3.600 · Ajuda Pais 3.438,50 · VA 700 · Vale Gasolina 448) | **R$ 11.686,50** | 100% |
| Despesas fixas | R$ 7.060,00 | **60%** |
| Despesas variáveis | R$ 5.568,40 | 48% |
| Extras + Adicionais | R$ 640,00 | 5% |
| Investimentos | R$ 0 | 0% |
| **Saldo** | **−R$ 1.581,90** | gastos de R$ 13.268,40 = 113,5% da renda |

- **Fevereiro tem um plano de corte.** Supermercado ×0,65, Restaurantes ×0,65 e Lanches ×0,5 estão em fórmulas. Combustível 900→600, Luz 200→120 e Psico 300→150 foram digitados à mão. Os gastos caem R$ 1.805,35 (para R$ 11.463,05) e o saldo passa a **+R$ 223,45**.
- **Março a agosto estão vazios.** De setembro a novembro só há receitas, Aluguel e Cota Unicred; dezembro tem só receitas. Por isso o SALDO desses meses mostra **sobras falsas** (+R$ 10.263,50 e +R$ 11.686,50), que não devem ser importadas como orçamento.

## 1.2 `Controle_Financeiro_1.xlsx` (2 abas)
- **“Registro Diário”** é um log de transações (Data, Tipo, Categoria, Subcategoria, Descrição, Valor, Forma de pagamento) com listas suspensas. **É o modelo certo** (uma linha por lançamento), mas está vazio.
- **“Controle Financeiro”** é um resumo anual por `SUMIFS` (subcategoria × mês), com 8 grupos, 34 subcategorias, saldo do mês e saldo acumulado.

## 1.3 Diagnóstico: o que os números já dizem
1. **O mês fechava no vermelho e o investimento era “o que sobrar”.** O bloco Investimentos está sempre vazio. Mesmo assim, há **R$ 220/mês de poupança registrada como despesa fixa** (Previdência Isa R$ 200 + Cota Unicred R$ 20); no app, isso vai para “Futuro”.
2. **As fixas consomem 60% da renda** (referência de mercado: até 50%). As maiores são Moradia R$ 2.228, Educação R$ 2.100 e Planos de saúde (3 vidas) R$ 1.186.
3. **Comer fora custa mais que o mercado:** Restaurantes 1.391 + Lanches 583 = R$ 1.974, contra R$ 1.420 de supermercado. Isso é **58% da alimentação** (o indicador sugerido mira menos de 40%). O corte de fevereiro economiza ~R$ 780/mês, mas continua em 56%, porque corta o mercado na mesma proporção. **Cortar mais fora e menos em casa.**
4. **A ajuda dos pais é 29% da renda.** A fórmula =2463+302,5+473+200 parece corresponder a despesas específicas: 2463 = Colégio 1.500 + College 250 + Unimed Isabela 240 + Unimed 473; 302,5 = Medicamentos Vini; 200 = Previdência Isa. Se for isso, os pais bancam a saúde da família e os custos da Isabela (*hipótese a confirmar com vocês*). **Sem essa ajuda, a renda própria seria R$ 8.248 e o déficit de janeiro seria −R$ 5.020,40.** O app deve mostrar o orçamento **com e sem** a ajuda.
5. **VA (R$ 700) e Vale Gasolina (R$ 448) são dinheiro carimbado:** viram carteiras com saldo próprio.
6. **O IPVA = 1500/12 mostra que vocês já fazem provisão de despesas sazonais.** Isso vira funcionalidade (IPVA, IPTU, material escolar, presentes de fim de ano).

## 1.4 Problemas estruturais que o app resolve
| Problema | Onde | Como o app resolve |
|---|---|---|
| A pessoa vira linha (“Unimed Panty”, “Unimed Isabela”, “Medicamentos Vini”) | Orçamento | **“Para quem”** vira um campo; a categoria é só “Plano de saúde” |
| Só existe o planejado, não o realizado | Orçamento | Lançamentos reais + orçamento → **orçado × realizado** |
| “Cartão de Crédito” como categoria, contando em dobro | Controle | Cartão é **meio de pagamento**; pagar a fatura é **transferência** |
| Fórmulas quebradas: TOTAL RECEITAS de jan. é um **0 digitado** (B9); linha 10 sem rótulo; fórmula solta em O49; maio sem totais (I76/I77/I88/I89); `#DIV/0!`; “Investimentos” do saldo não ligado ao total; valores digitados no lugar de fórmula (P7, F41) | Ambas | Totais calculados pelo sistema, nunca digitados |
| Mês calculado pela posição da coluna (`COLUMN()`) e ano preso em `YEAR(TODAY())`: inserir uma coluna ou virar o ano quebra o histórico | Controle | Histórico ilimitado, comparação ano a ano |
| O resumo soma só por subcategoria (ignora Tipo e Categoria); não existe “Transferência” nem linha de aporte; data e valor sem validação; subcategoria não filtrada pela categoria; sem “quem lançou”, sem fixa/variável e sem metas | Controle | Tipo obrigatório (despesa, receita, transferência), validações, árvore de categorias, autor, natureza e orçamento |

**O que aproveitar:** o log de transações (planilha 2), a classificação Fixas/Variáveis/Extras/Adicionais e o “% sobre receita” (planilha 1), as categorias reais da família e o rateio mensal (IPVA/12).

---
[← Voltar ao README](../README.md)
