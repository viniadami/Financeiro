# Categorias e modelo de dados

## Categorias e dimensões (baseadas nas planilhas, editáveis no app)

**Receitas:** Salário Vini · Salário Panty · Benefícios (VA, Vale-combustível) · Ajuda familiar · Renda extra · Rendimentos · Outras. **Sazonais:** 13º · Férias (+1/3) · PLR/Bônus · Restituição de IR. Ficam fora da renda-base mensal e entram num **plano anual** com destino decidido antes de o dinheiro chegar.

**Despesas (grupo → subcategorias):**
- 🏠 **Moradia:** Aluguel · Condomínio · IPTU · Luz · Água · Gás · Internet/TV · Celular · Manutenção
- 🚗 **Transporte:** Combustível · Consórcio/Financiamento · Seguro · IPVA/Licenciamento · Manutenção · Uber/App · Estacionamento
- 🛒 **Alimentação:** Supermercado · Feira · Restaurantes · Delivery · Lanches/Café
- 🏥 **Saúde:** Plano de saúde · Medicamentos · Consultas/Exames · Dentista · Terapia
- 📚 **Educação:** Escola · Faculdade · Cursos/Idiomas · Material/Uniforme
- 💅 **Cuidados pessoais:** Cabeleireiro · Manicure · Estética
- 🎾 **Lazer & Esporte:** Clube · Tênis · Futebol · Academia · Passeios · Viagens
- 👕 **Vestuário:** Roupas · Calçados · Costureira
- 📱 **Assinaturas** · 🎁 **Presentes & Datas** · 🔓 **Dinheiro livre** (Vini / Panty)
- 💳 **Financeiro:** Tarifas/Anuidade · Juros/IOF/Multas · Empréstimos · Impostos (inclui DAS/carnê-leão da renda extra)
- 🌱 **Futuro (não é despesa):** Reserva · Metas · Previdência (ex.: Previdência Isa) · Cotas/Investimentos

**Campos de cada lançamento (dimensões, não categorias):**
- **Quem lançou** (Vini/Panty) e **Para quem** (Casa/Vini/Panty/Isabela)
- **Conta/cartão** (de onde saiu) e **Meio** (PIX · débito · crédito à vista · crédito parcelado · boleto · débito automático · dinheiro · benefício)
- **Natureza:** Fixa · Variável · Eventual · Estilo de vida, mapeada para Essenciais / Estilo de vida / Futuro
- **Status:** Previsto · Pago · Aguardando sincronizar
- **Visibilidade:** Casa (padrão) ou Privado (dinheiro livre)

## Modelo de dados e regras (conceitual, sem código)

**Entidades:**
- **Família** → **Membros** (Vini e Panty, mesmo acesso) → **Pessoas** (“para quem”)
- **Contas/Carteiras** (corrente, VA, vale, dinheiro, investimento, “a receber de…”)
- **Cartões** → **Faturas** (fechamento e vencimento reais) · **Dívidas** (saldo, taxa, parcelas)
- **Categorias** · **Lançamentos** (com itens de divisão) · **Recorrências** · **Orçamentos** (mês × categoria)
- **Metas** · **Provisões** · **Plano anual** (receitas sazonais)
- **Comprovantes** (arquivo, tipo, hash, dados extraídos, confiança, chave NFC-e, ID E2E do PIX, linha digitável) → **Itens do cupom**
- **Regras de categorização** (por estabelecimento, CNPJ ou recebedor) · **Prestadores** (CPF/CNPJ, para o IR) · **Notas de fechamento** (combinados)

**Regras de competência (decidir antes de codar)**
1. Crédito à vista conta no **orçamento do mês da compra** e no **caixa do vencimento da fatura**.
2. Parcelado gera N parcelas ligadas entre si. Cada parcela conta no mês da fatura em que cai, e o total aparece em “Comprometimento futuro”.
3. Compra feita no dia do fechamento ou depois vai para a fatura seguinte. Anuidade, IOF e juros entram em Financeiro.
4. Pagar fatura, aportar em investimento e mover dinheiro entre contas são **transferências**, não despesas. Pagamento parcial da fatura gera alerta de rotativo.
5. Estorno, devolução e reembolso (inclusive do plano de saúde) são **despesa negativa** vinculada ao lançamento original, nunca receita.
6. A data do lançamento é um *dia* no fuso de São Paulo (um gasto às 22h do dia 31 fica no dia 31). A receita conta no mês em que entra.

**Casos-limite que entram no esquema da Fase 1** (as telas podem vir depois)
- Valores em **centavos inteiros**.
- **Divisão** de um lançamento em vários itens.
- Despesa rachada com terceiros (“minha parte” + “a receber de…”).
- Moeda estrangeira (valor original, cotação e IOF).
- Saldo inicial e “ajuste de saldo” na conferência.
- Identificador gerado no aparelho (para a sincronização offline), autor e editor, exclusão lógica.

**Divisão do casal** (decidida na Fase 0): pote comum, proporcional à renda ou meio a meio. Nos dois últimos casos, o app calcula o **acerto do mês** (“Vini → Panty: R$ 312”) e registra a transferência.

**Privacidade:** lançamentos do dinheiro livre só são visíveis para o autor, garantido por regra de acesso no banco (RLS); o cônjuge vê só o total. O app nunca avisa “Fulano gastou R$ X”: avisos de lançamentos do cônjuge são opcionais e nunca valem para o dinheiro livre.

**IR:** subcategorias de saúde e educação vêm marcadas como “possivelmente dedutível”. O lançamento guarda o beneficiário, o prestador e o comprovante, e os reembolsos abatem o valor dedutível. O relatório “Resumo para o IR” sai em fevereiro/março. *O app organiza; as regras e os tetos devem ser conferidos no programa da Receita.*

**Importação e conciliação:** cada lançamento guarda a `origem` (manual, foto, importado) e um `id_externo` (FITID do OFX, ID E2E do PIX, ou um hash). Na importação, o app sugere **vincular** ao lançamento manual de mesmo valor e conta, com data ±3 dias, e mantém a categoria do manual com a data e o valor oficiais. O que não casar vai para “Pendentes”.

---
[← Voltar ao README](../README.md)
