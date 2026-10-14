# Visão do produto

**Princípios**
1. **Lançar em 5 segundos, ou com uma foto.** Teclado numérico abre direto, categorias mais usadas primeiro, conta sugerida pela categoria.
2. **Um app, duas faces.** Celular para lançar e consultar; desktop para analisar e planejar.
3. **Tempo real entre os dois, mesmo sem internet.** Salva no aparelho e sincroniza depois; o que um lança aparece para o outro.
4. **Pague-se primeiro, na ordem certa:** (1) parar o déficit e quitar dívidas caras (rotativo, cheque especial); (2) mini-reserva de 1 mês; (3) reserva de 3 a 6 meses; (4) metas e investimentos. Enquanto houver déficit, “Futuro” começa pequeno, só para criar o hábito.
5. **Sem culpa, com combinados.** Cada um tem um **dinheiro livre** mensal privado: o outro vê só o total, garantido no banco de dados. Nas revisões, o casal discute envelopes, não pessoas.

**Celular (dia a dia):** lançamento rápido (despesa, receita, transferência, parcelado, recorrente); **lançar por foto** ([detalhes](03-lancamento-por-foto.md)); resumo do mês com “pode gastar até 31/10” e ritmo de gasto; envelopes; contas do mês (pago / a vencer / atrasada); cartões e faturas; avisos (envelope em 80%/100%, conta vencendo).

**Desktop (análise):** fechamento mensal guiado; planejamento do orçamento (base zero); tabela de lançamentos com edição em massa; importação de CSV/OFX com conciliação; dashboard; **visão anual** (a “planilha” gerada dinamicamente, com detalhamento até o lançamento); metas, reserva, provisões e renda extra; exportar para Excel.

**Rituais do casal (o app conduz)**
- **Semanal (10 min):** revisar a semana, os envelopes em alerta e **conferir o saldo de cada conta com o banco**.
- **Mensal (20–30 min, entre o dia 1 e o dia 5):** fechamento → destino da sobra → orçamento do próximo mês → anotar combinados.
- **Anual:** revisão do ano, metas, provisões e plano do 13º.

**Indicadores financeiros**
| Indicador | Fórmula | Meta inicial (definida pelo casal) |
|---|---|---|
| Taxa de poupança | (receitas − despesas) ÷ receitas | 10%, depois 20% |
| Comprometimento fixo | fixas ÷ receitas | referência: até 50% |
| Aderência ao orçamento | % de categorias dentro do planejado | ≥ 80% |
| Comer fora | (restaurantes + delivery + lanches) ÷ alimentação | < 40% |
| Dependência de ajuda | ajuda familiar ÷ receitas | queda mês a mês |
| Meses de reserva | reserva ÷ custo essencial mensal (o casal define o essencial; pela planilha, ~R$ 9–10 mil) | marcos de 1, 3 e 6 meses |
| Comprometimento futuro | parcelas a vencer | em queda |

**Métricas do produto (o app está funcionando para nós?)**
| Métrica | Meta |
|---|---|
| Cobertura (gastos lançados ÷ saídas do extrato e da fatura) | ≥ 90% no 2º mês |
| Uso pelos dois | ≥ 4 dias com lançamento por semana, cada um |
| Atraso (data do registro × data do gasto) | mediana ≤ 1 dia |
| Tempo do “+” até “Salvar” | ≤ 7 s |
| Rituais feitos | 3 de 4 semanas + 1 fechamento por mês |
| Resultado em 90 dias | sair do negativo (com e sem a ajuda) |

Se a cobertura ficar abaixo de 80%, simplifique o lançamento antes de criar telas novas.

> 50/30/20, “fixas até 50%” e “6 meses de reserva” são referências de mercado, não regras. O app **não recomenda produtos financeiros**: a área de investimentos só registra e acompanha.

## Como começar (próximos passos práticos)

1. **Conversa do casal (1h):** objetivos de 12 meses (ex.: zerar o déficit, mini-reserva, 10% de poupança), modelo de divisão, valor do dinheiro livre, o que é da casa e o que é individual.
2. **Dívidas:** como o déficit era coberto? Se houver cartão rotativo, cheque especial ou empréstimo, listar saldo, taxa e parcelas. Quitar isso vem primeiro.
3. **Validar a árvore de categorias** ([categorias](04-categorias-e-modelo-de-dados.md)).
4. **Inventário:**
   - contas e cartões, com dia de fechamento e vencimento;
   - fixas, com vencimento e meio de pagamento;
   - **rendas líquidas atuais** (os valores de 2023/2024 provavelmente mudaram);
   - formato de exportação de cada banco (OFX, CSV ou só PDF).
5. **Juntar 3 meses de extratos e faturas**, para um orçamento inicial realista.
6. **Plano do 13º e de janeiro/fevereiro** (IPVA, IPTU, matrícula, material): **fazer agora, no papel**, porque chega antes de o app ficar pronto.
7. **Começar a registrar já:** usem o “Registro Diário” num Google Sheets compartilhado com as novas categorias, e guardem as fotos dos comprovantes numa pasta compartilhada. Tudo será importado no MVP.
8. **Design (1 semana)** no Claude Design, com os [prompts de design](06-prompts-de-design.md). Os dois testam o protótipo com uma mão, em pé.
9. **MVP com Claude Code** em ciclos curtos, já usando no dia a dia.

---
[← Voltar ao README](../README.md)
