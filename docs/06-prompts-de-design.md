# Design e prompts para o Claude Design

## Vale a pena? Sim, com foco

**Por quê:**
- O fluxo de lançamento decide se o app vai ser usado; vale validar no protótipo antes de codar.
- A identidade visual é definida uma vez só.
- As telas viram a especificação do desenvolvimento.

**Como usar no Claude Design:**
1. Crie um projeto “Nosso Caixa”.
2. Cole o **Prompt 0** primeiro. Ele define o sistema visual, os **Dados de referência** (os números que todas as telas compartilham, com as somas conferidas) e as regras.
3. Peça **uma tela por prompt, no mesmo projeto**.
4. Itere com pedidos curtos (“mostre em modo escuro”, “aumente o valor”).
5. Leve o resultado para o desenvolvimento: handoff para o Claude Code ou exportação para `docs/design/`.

**Ordem:**
- **A — MVP:** P0 → P0.1 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10 → P11 → **protótipo clicável**.
- **B — Foto:** P12 → P13.
- **C — Desktop e futuro:** P14 → P19.

**Protótipo clicável:**
- **Caminho principal:** Início → “+” → digitar 8740 → Supermercado → Salvar → toast com Desfazer → Início atualizada (Alimentação 85%) → Lançamentos → tocar no item → Editar → Salvar.
- **Modo avião:** o mesmo fluxo mostrando “aguardando sincronizar”.
- **Foto:** “+” → câmera → revisão → confirmar.

Os prompts completos estão logo abaixo.

## Prompts

### Grupo A — MVP

#### P0 — Contexto, sistema visual, dados de referência e regras (cole primeiro)
> **Contexto.** Você vai desenhar um app de finanças pessoais para um casal brasileiro (Vini e Panty) que administra a casa junto; a família inclui a Isabela. Nome provisório: “Nosso Caixa”. Objetivos: (1) lançar gastos em segundos pelo celular, ou por foto do comprovante; (2) ver para onde vai o dinheiro; (3) seguir um orçamento mensal combinado; (4) começar a poupar, investir e acompanhar renda extra. São duas versões: app mobile (PWA, uso diário) e desktop (análise e planejamento). Idioma pt-BR, R$ no formato 1.234,56, datas dd/mm.
>
> **Identidade.** Calma, confiável e acolhedora; sem cara de banco nem de planilha. Tipografia sans-serif com números tabulares e valores grandes. Cards arredondados com bastante respiro. Cada categoria tem ícone e cor próprios (Moradia, Transporte, Alimentação, Saúde, Educação, Cuidados pessoais, Lazer & Esporte, Vestuário, Assinaturas, Presentes, Dinheiro livre, Financeiro, Futuro).
>
> **Cores semânticas, seguras para daltonismo (nunca transmita estado só pela cor):**
> - Fundo #F7F5F0.
> - Primária verde-petróleo #0B5D5B, usada para marca, ações e **receitas** (sempre com “+” e ↑).
> - **Despesas na cor de texto neutra #1C2321, com “−”.**
> - Âmbar #8A5300 (texto) / #A86A00 (preenchimento) para alerta, sempre com ícone.
> - Terracota #B23F25 só para estouro e atraso, sempre com “!” e texto (“passou R$ 30”).
> - Não use um segundo verde.
>
> **Barra de orçamento.** Trilho #E3E8E6. Preenchimento na cor primária até 79%; âmbar de 80% a 100%, com ícone e marcador do limite. Acima de 100%, o excedente aparece como um segmento terracota com hachura além do limite. O percentual fica sempre escrito.
>
> **Modo escuro.** Cada cor tem um par claro/escuro:
> - fundo #0F1514, superfície #18201F, superfície elevada #222C2A;
> - texto #E8EEEC, texto secundário #A3B0AC;
> - primária #5CC2B5, com texto #0F1514 sobre ela;
> - âmbar #F2B54A e terracota #F08B6E;
> - trilho #2A3533.
>
> A elevação vem de superfícies mais claras, não de sombra. Monte a página do sistema visual nos dois modos, lado a lado, e mostre receita, despesa, alerta e estouro simulados em deuteranopia e protanopia.
>
> **Acessibilidade.**
> - Contraste AA.
> - Alvos de toque ≥ 44px (teclas e categorias ≥ 56px).
> - Texto ampliado até 200% sem cortar valores.
> - Alternativa visível para todo gesto de deslizar.
> - Foco visível no desktop e respeito a “reduzir movimento”.
>
> **Componentes base:** card de KPI; barra de orçamento; chip de categoria; avatar de quem lançou (V / P); teclado numérico; lista agrupada por dia; selos “previsto”, “parcela 2/6”, “aguardando sincronizar” e “privado” (cadeado); bottom navigation (Início, Lançamentos, “+” central, Orçamento, Mais); sidebar desktop.
>
> **Dados de referência — use em TODAS as telas e não invente números que quebrem estas somas.** Hoje é quarta-feira, 14/10/2026 (dia 14 de 31; faltam 17 dias).
>
> **Receitas de outubro (já recebidas):** Salário Vini R$ 3.500,00 · Salário Panty R$ 3.600,00 · Ajuda familiar R$ 3.438,50 · Vale-alimentação R$ 700,00 · Vale-combustível R$ 448,00 = **R$ 11.686,50**.
>
> **Orçamento (base zero):**
> - Futuro R$ 600,00: Reserva R$ 300 · Férias R$ 80 · Previdência da Isabela R$ 200 · Cota Unicred R$ 20, separados em 05/10.
> - Fixas R$ 6.840,00.
> - Variáveis R$ 4.096,50.
> - Total orçado R$ 11.536,50 → **a distribuir R$ 150,00**.
> - Anel: Essenciais R$ 8.420,00 (72%) · Estilo de vida R$ 2.516,50 (22%) · Futuro R$ 600,00 (5%) · sem destino R$ 150,00 (1%).
>
> **Fixas:**
> - Pagas: R$ 2.550,00.
> - Atrasada: Seguro do carro R$ 201,00 (venceu 10/10).
> - A vencer: Aluguel R$ 1.403,00 (15/10) · Planos de saúde R$ 1.186,00 (18/10) · Colégio R$ 1.500,00 (20/10).
> - Total a pagar: R$ 4.290,00.
>
> **Variáveis (gasto / orçado):**
> - Alimentação R$ 1.768,00 / R$ 2.080,00 (85%, restam R$ 312,00):
>   - Supermercado R$ 690,40 / R$ 1.000
>   - Restaurantes R$ 548,00 / R$ 600
>   - Delivery R$ 362,60 / R$ 300 (121%, estourado)
>   - Lanches/Café R$ 167,00 / R$ 180
> - Transporte R$ 210,00 / R$ 600,00
> - Dinheiro livre R$ 215,00 / R$ 500,00 (Vini R$ 120 de R$ 250 · Panty R$ 95 de R$ 250)
> - Presentes & Datas R$ 180,00 / R$ 150,00 (passou R$ 30)
> - Demais categorias R$ 30,40 / R$ 766,50
> - **Total: R$ 2.403,40 de R$ 4.096,50 (59%).**
>
> **Derivados:**
> - Despesas até hoje: R$ 4.953,40.
> - **Pode gastar até 31/10: R$ 1.693,10 (≈ R$ 100/dia).**
> - Sobra prevista: R$ 750,00 (R$ 600 já no Futuro + R$ 150 sem destino).
> - Conferência: 11.686,50 − 4.953,40 − 4.290,00 − 1.693,10 = 750,00.
>
> **Indicadores:**
> - Taxa de poupança prevista 6,4% (meta do casal: 10%).
> - Fixas 59% da renda (referência: até 50%).
> - Comer fora 61% da alimentação (meta: menos de 40%).
> - Dependência da ajuda familiar 29%; sem ela, a renda seria R$ 8.248,00 e faltariam R$ 3.288,50 para cobrir o orçado.
>
> **Saldos:**
> - Reserva de emergência R$ 7.600,00. O casal definiu o custo essencial em R$ 9.000/mês, então os marcos são: 1 mês = R$ 9.000 (84%) · 3 meses = R$ 27.000 (28%) · 6 meses = R$ 54.000 (14%).
> - Vale-alimentação R$ 420,00 de R$ 700. Vale-combustível R$ 238,00 de R$ 448.
> - Cartão Vini: fatura fechada R$ 1.926,80 (fechou 07/10, vence 17/10) e fatura aberta R$ 684,20. Cartão Panty: fatura aberta R$ 1.152,90 (fecha 25/10, vence 05/11).
>
> **Último lançamento:** Panty, há 2 minutos, Supermercado R$ 87,40 no Vale-alimentação. Antes dele, Alimentação estava em R$ 1.680,60 (81%) e o VA em R$ 507,40.
>
> **Regras para todos os pedidos:** cada pedido é uma tela. Frames mobile 390×844 e desktop 1440×900. Quando eu pedir estados, faça um frame por estado, lado a lado, com rótulo. Use só os Dados de referência; se precisar de um número novo, mantenha as somas coerentes. Textos reais em pt-BR, sem lorem ipsum.

#### P0.1 — Ajustes no sistema visual (iteração após a revisão do P0)
> Ajuste a página do sistema visual nos modos claro e escuro, **lado a lado**. Mantenha tudo o que já está aprovado: cores, tipografia Manrope, barra de orçamento, simulação de daltonismo e componentes. Use só os Dados de referência; não mude nenhum número.
>
> **Correções**
> 1. **Teclado numérico:** a digitação é tipo caixa eletrônico (8-7-4-0 vira R$ 87,40), então troque a tecla “,” por “00”.
> 2. **Sinal de menos:** use o caractere “−” (U+2212) seguido de espaço em todas as despesas (“− R$ 87,40”): teclado, KPIs, lista e simulação de daltonismo. Nada de hífen nem travessão.
> 3. **Lista por dia:** o valor nunca quebra linha; o nome quebra em até 2 linhas e depois trunca com reticências. Encurte o detalhe do seguro para “! atrasada há 4 dias”.
> 4. **Contas a pagar na lista** (Seguro do carro, Aluguel) não são despesas pagas: as duas levam o selo “previsto” e um botão “Pagar”; o Seguro mantém o aviso de atraso.
> 5. **Cores das categorias:**
>    - Lazer & Esporte sai do verde-oliva (não pode haver segundo verde).
>    - Futuro não usa o verde-petróleo da primária, que significa receita.
>    - Presentes e Saúde se afastam do fundo de estouro (#F6E1DB).
>    - Moradia, Transporte e Financeiro ficam distinguíveis entre si.
>    - Mostre uma tabela das 13 categorias com ícone, cor do ícone e cor do fundo, no claro e no escuro, com os hex e o contraste do ícone sobre o fundo (mínimo 3:1).
> 6. **Contraste das amostras:** diga sobre qual superfície cada contraste foi medido. No escuro, informe também o contraste sobre a superfície #18201F, onde ficam os cards.
>
> **Novas seções**
> 7. **Texto a 200%:** o card “Pode gastar até 31/10 — R$ 1.693,10” e a linha “Supermercado · − R$ 87,40” em 390px de largura, sem cortar nenhum valor.
> 8. **Foco visível:** anel de 3px também em chip de categoria, tecla do teclado, botão “Salvar lançamento” e item da lista.
> 9. **Estados de interação** para botão, chip e tecla: normal, pressionado, desabilitado e carregando. E o estado vazio da lista: “Nenhum lançamento ainda”, com o botão “Lançar o primeiro gasto”.
> 10. **Movimento:** tabela com as durações das animações (bottom sheet, toast, barra de orçamento) e o que muda com “reduzir movimento” ligado (sem deslizar; fade curto ou nenhuma animação).
> 11. **Teto da barra de orçamento:** a barra nunca passa da largura do card. A partir de 150%, o segmento terracota para, ganha uma marca de quebra e o percentual continua escrito. Mostre com um exemplo rotulado “exemplo” (Delivery a 250%), fora dos Dados de referência.
> 12. **Tokens:** um bloco final, pronto para copiar, com variáveis CSS para claro e escuro: cores (`--color-bg`, `--color-surface`, `--color-surface-subtle`, `--color-text`, `--color-text-secondary`, `--color-primary`, `--color-on-primary`, `--color-amber-text`, `--color-amber-fill`, `--color-terracotta`, `--color-track`, fundos de estado e as 13 categorias), tipografia, raios, espaçamentos e a sombra do modo claro.

#### P1 — Mobile: Lançamento rápido (a tela mais importante)
> Bottom sheet sobre a Início (390×844), aberto pelo “+”, para usar com uma mão. Fluxo-alvo: digitar o valor → 1 toque na categoria → 1 toque em Salvar. De cima para baixo:
> 1. **Faixa superior (só leitura):** alça do sheet; seletor Despesa | Receita | Transferência (Despesa pré-selecionada); valor enorme “R$ 87,40”; ícone de câmera para “lançar por foto”.
> 2. **Zona do meio:** grade 4×2 com as 8 categorias mais usadas (alvos ≥ 56px) e “Todas”. Abaixo, chips com padrões inteligentes: “Hoje”, “Vale-alimentação” (conta sugerida pela categoria: Supermercado → VA, Restaurantes → Cartão Panty), “Casa” e “+ Mais” (descrição, anexar comprovante, parcelado, repetir todo mês, “Meu dinheiro livre” com cadeado — este torna o lançamento privado).
> 3. **Zona do polegar:** teclado 3×4 com digitação tipo caixa eletrônico (8-7-4-0 vira R$ 87,40); botão “Salvar” largo (56px) e “Salvar e lançar outro” ao lado.
>
> Nenhuma ação obrigatória acima da metade da tela. Desenhe 5 frames rotulados:
> - **(A)** R$ 87,40 digitado, com Alimentação selecionada.
> - **(B)** Subcategorias de Alimentação com o quanto resta em cada envelope; Delivery aparece “estourado”.
> - **(C)** Toast “R$ 87,40 em Alimentação › Supermercado · restam R$ 312,00 · VA: saldo R$ 420,00”, com “Desfazer”.
> - **(D)** Transferência “Pagar fatura”: Conta Vini → Cartão Vini, R$ 1.926,80, com a nota “transferência não conta como despesa”.
> - **(E)** Arrastar para baixo com valor digitado → “Descartar R$ 87,40?”.

#### P2 — Mobile: Início
> 390×844, claro e escuro. Topo: “Oi, Vini”, seletor “Outubro 2026” e avatares V e P (P com indicador online).
>
> **Card principal:**
> - Título “Pode gastar até 31/10”, valor grande **R$ 1.693,10** e “≈ R$ 100 por dia”.
> - Três mini-valores: Recebido R$ 11.686,50 · Gasto R$ 4.953,40 · A pagar R$ 4.290,00.
> - Rodapé: “Sobra prevista: + R$ 750,00 (R$ 600 já guardados no Futuro)”.
> - Régua de ritmo: marcador “hoje — dia 14 de 31 (45%)” sobre “59% dos variáveis usados”, com o texto “Acima do ritmo” e ícone.
>
> **Envelopes:**
> - Alimentação: R$ 1.768 de R$ 2.080 — restam R$ 312 (âmbar).
> - Transporte: R$ 210 de R$ 600.
> - Dinheiro livre: R$ 215 de R$ 500.
> - Presentes & Datas: passou R$ 30 (terracota com hachura).
>
> **Contas da semana:** Seguro do carro, atrasada desde 10/10 (primeiro da lista); Aluguel, amanhã; Planos de saúde, 18/10; Colégio, 20/10. Cada uma com botão “Pagar”.
>
> **Últimos lançamentos:** “Supermercado · Vale-alimentação · − R$ 87,40 · P · há 2 min”, com selo “novo”.
>
> **Card de meta:** “Reserva — R$ 7.600 de R$ 9.000 (marco 1: 1 mês) · 84%”.
>
> “+” central em destaque na barra de navegação.

#### P3 — Mobile: Lançamentos
> 390×844. Lista do mês agrupada por dia, com o total de cada dia. Cada item mostra ícone, descrição, “subcategoria · conta/cartão”, avatar e valor (despesa neutra com “−”, receita na primária com “+”). Selos: “previsto”, “parcela 2/6”, relógio para “aguardando sincronizar”.
>
> No topo: busca e chips de filtro (Pessoa, Categoria, Conta/Cartão, Tipo, Natureza). Exemplo de filtro ativo: Pessoa = Panty · Alimentação → 23 lançamentos · R$ 1.024,30.
>
> Deslizar o item é só um atalho para editar, duplicar ou excluir; tudo isso também existe no detalhe. Lançamentos privados do cônjuge não aparecem.

#### P4 — Mobile: Detalhe e edição do lançamento
> Frames 390×844:
> - **(A)** Detalhe de “Manutenção do carro · Cartão Vini · parcela 2/6 · R$ 215,00”. Compra de R$ 1.290,00 em 18/08. Nota: “cada parcela conta no mês da fatura em que cai”. Mostra para quem, miniatura do comprovante e histórico (“Lançado por Vini em 18/08 · editado por Panty em 20/08”). Botões Editar / Duplicar / Excluir.
> - **(B)** Edição em sheet, com o mesmo teclado do lançamento rápido.
> - **(C)** Ao editar uma parcela ou recorrência: “Só esta / Esta e as próximas / Todas”.
> - **(D)** Exclusão com toast “Desfazer” por 5 s; parcelados e recorrentes pedem confirmação.
> - **(E)** “Marcar como pago” do Aluguel R$ 1.403, escolhendo a conta.

#### P5 — Estados do sistema
> Um frame 390×844 por estado, lado a lado e rotulados:
> 1. **Primeiro uso:** “Seu primeiro lançamento leva 5 segundos”, com seta para o “+”.
> 2. **Filtro sem resultado:** com botão “Limpar filtros”.
> 3. **Carregando:** skeletons que mantêm o layout.
> 4. **Sem conexão:** faixa “2 lançamentos aguardando sincronizar”; o lançamento salva normalmente com toast “Salvo no celular · sincroniza quando a internet voltar”.
> 5. **Sincronizado:** “2 lançamentos sincronizados”.
> 6. **Conflito:** “Panty alterou este lançamento há 1 min (R$ 150,00 → R$ 158,90). Manter o dela ou o seu?”.
> 7. **Erro ao salvar:** o valor digitado é preservado, com “Tentar de novo”.
> 8. **Câmera negada:** com caminho para os ajustes.
> 9. **Sessão expirada:** pede login sem perder o que foi digitado.

#### P6 — Primeiro acesso e convite
> Frames 390×844 com barra de progresso e “Pular”.
>
> **Lado do Vini:**
> 1. Entrar com e-mail + código de 6 dígitos.
> 2. Criar a família “Casa Vini & Panty” e as pessoas Casa, Vini, Panty e Isabela.
> 3. Convidar a Panty por link, QR ou WhatsApp; estado “aguardando”.
> 4. Contas e cartões: Conta Vini, Conta Panty, VA (R$ 700/mês), Vale-combustível (R$ 448/mês), Cartão Vini (fecha dia 07, vence dia 17), Cartão Panty (fecha dia 25, vence dia 05).
> 5. Rendas e fixas com dia de vencimento: Aluguel R$ 1.403, dia 15 · Planos de saúde R$ 1.186, dia 18 · Colégio R$ 1.500, dia 20…
> 6. Primeiro orçamento: renda R$ 11.686,50 · fixas R$ 6.840,00 · Futuro R$ 600,00 · variáveis R$ 4.096,50 · a distribuir R$ 150,00.
> 7. Modelo de divisão do casal (pote comum / proporcional / meio a meio) e valor do dinheiro livre (R$ 250 cada).
>
> **Lado da Panty:**
> 8. Aceite do convite, explicando o que cada um vê: tudo da casa; do dinheiro livre do outro, só o total.
> 9. **Instalar o app:** no iPhone, passo a passo ilustrado (Safari → Compartilhar → Adicionar à Tela de Início); no Android, botão “Instalar”.
> 10. Permitir notificações, explicando o benefício, com opção “Agora não”.

#### P7 — Mobile: Orçamento do mês
> Três frames 390×844: topo, meio da lista e com a chave “Sem ajuda” ligada.
>
> **Topo:** Renda R$ 11.686,50 · Orçado R$ 11.536,50 · **A distribuir R$ 150,00**. Chave “Com ajuda familiar / Sem ajuda”: ligada, mostra “faltam R$ 3.288,50 para cobrir o orçado”. Anel 72/22/5/1 com as marcas de referência 50/30/20 e legenda em texto.
>
> **Envelopes, nesta ordem:**
> 1. Futuro R$ 600 de R$ 600 (guardado ✓ — primeira linha: pague-se primeiro).
> 2. Fixas R$ 2.550 pagas de R$ 6.840 (1 atrasada).
> 3. Alimentação R$ 1.768 de R$ 2.080, expandida, mostrando Delivery estourado.
> 4. Transporte R$ 210 de R$ 600.
> 5. Dinheiro livre R$ 215 de R$ 500.
> 6. Presentes & Datas — passou R$ 30, com a ação “Cobrir com R$ 30 de Transporte”.
>
> **Ações:** “Copiar setembro”, “Média de 3 meses” e editar o valor tocando nele.

#### P8 — Mobile: Contas e cartões
> 390×844.
>
> **Saldos:** Conta Vini, Conta Panty, VA R$ 420 de R$ 700 (“no ritmo atual sobram ~R$ 80 em 31/10”), Vale-combustível R$ 238 de R$ 448, Dinheiro R$ 60.
>
> **Cartões:**
> - Cartão Vini: fatura fechada R$ 1.926,80, vence 17/10, com botão “Pagar fatura”; fatura aberta R$ 684,20, fecha 07/11.
> - Cartão Panty: fatura aberta R$ 1.152,90, fecha 25/10.
>
> Nota fixa: “Compras no cartão contam no orçamento na data da compra; pagar a fatura não é despesa.”

#### P9 — Mobile: Fatura do cartão
> 390×844. Fatura do Cartão Vini que vence 17/10 (R$ 1.926,80):
> - Compras do ciclo 08/09–07/10, agrupadas por dia.
> - Parcelas em andamento: “Manutenção do carro 2/6 · R$ 215,00”.
> - Gráfico das parcelas futuras: nov R$ 304,90 · dez R$ 215,00 · jan R$ 215,00 · fev R$ 215,00.

#### P10 — Mobile: Contas fixas do mês
> 390×844. Checklist de outubro: pago R$ 2.550,00 × a pagar R$ 4.290,00 (total R$ 6.840,00).
>
> - **Atrasada (no topo):** Seguro do carro R$ 201, em terracota com “!”.
> - **A vencer:** Aluguel R$ 1.403 (15/10) · Planos de saúde R$ 1.186 (18/10) · Colégio R$ 1.500 (20/10). Cada uma mostra o meio (boleto, PIX, débito automático) e um botão “copiar código”.
> - **Pagas (recolhidas):** Condomínio R$ 280 · Outros moradia R$ 545 · Consórcio R$ 350 · Psicóloga R$ 300 · Faculdade R$ 350 · College R$ 250 · IPTU R$ 100 e IPVA R$ 125 (provisões) · Recreio R$ 250.

#### P11 — Mobile: Mais, configurações e notificações
> Frames 390×844:
> - **(A) Mais:** atalhos para Contas e cartões, Futuro, Comprovantes e Fechamento. Lista: Categorias, Família, Fixas e recorrências, Notificações, Aparência (Claro/Escuro/Automático), Exportar dados, Sair.
> - **(B) Categorias:** árvore com ícone, cor e natureza; reordenar; arquivar em vez de apagar; “Mesclar em…”.
> - **(C) Família:** membros, pessoas, convite pendente, modelo de divisão e dinheiro livre (R$ 250 cada, com a regra de privacidade explicada).
> - **(D) Central de notificações:** “Alimentação chegou a 85%”, “Aluguel vence amanhã”, “Seguro do carro atrasado desde 10/10”, “Revisão semanal hoje às 19h”, cada uma com ação direta.
> - **(E) Preferências:** envelopes 80%/100%, vencimentos, lembrete de domingo; “lançamentos do cônjuge” desligado por padrão e nunca para o dinheiro livre.
>
> Inclua 2 notificações na tela de bloqueio do iPhone.

### Grupo B — Foto e comprovantes

#### P12 — Mobile: Lançar por foto
> Frames 390×844. Simulação isolada: os valores **não** somam aos Dados de referência.
> - **(A) Câmera:** moldura e modos Cupom/Nota · PIX · Boleto · Galeria. Aviso “QR Code da nota fiscal detectado”.
> - **(B) Lendo:** miniatura com “Lendo comprovante…” e skeleton; dá para continuar usando o app.
> - **(C) Revisão do cupom de mercado:**
>   - “Supermercado Bom Preço · CNPJ 12.345.678/0001-90 · 14/10 18:42 · R$ 287,35 · Cartão Panty (final 4821)”.
>   - 23 itens agrupados: Alimentação R$ 231,80 · Limpeza R$ 32,40 · Higiene R$ 23,15.
>   - Chave “Dividir por categoria / Tudo em Supermercado”.
>   - Campo de baixa confiança em âmbar com “confira”; botão “Confirmar lançamento”.
> - **(D) Revisão de PIX:**
>   - “PIX enviado · R$ 150,00 · para Clínica Exemplo (CNPJ parcial) · 12/10 09:15 · Conta Vini · ID E2E E1234…”.
>   - Categoria sugerida “Saúde › Terapia”, com “lembrar para este recebedor” e etiqueta “Dedutível no IR”.
> - **(E) Duplicado:** “A Panty já lançou R$ 287,35 em Supermercado hoje às 18:45 — vincular a foto a esse lançamento?”.
> - **(F) Boleto:** “Condomínio · R$ 280,00 · vence 10/11” → “Agendar como conta do mês”, com “copiar linha digitável”.

#### P13 — Mobile: Cofre de comprovantes
> 390×844.
> - Galeria/lista com filtros (Cupom, PIX, Boleto, Recibo médico, Nota fiscal) e busca por estabelecimento, valor ou data.
> - Etiquetas “Dedutível no IR” e “Garantia até 03/2028”.
> - Cada comprovante mostra o lançamento vinculado.
> - Faixa “3 comprovantes aguardando revisão”.
> - Indicador “312 MB de 1 GB”.
> - Ações “Exportar ZIP de 2026” e “Pacote do IR”.

### Grupo C — Desktop e futuro

#### P14 — Desktop: Fechamento de setembro (ritual do casal)
> Um frame 1440×900 por etapa (5) + conclusão, com stepper no topo. Feito em 04/10/2026.
> 1. **Resumo:** Receitas R$ 11.686,50 · Despesas R$ 11.212,30 · Sobra R$ 474,20 (agosto: −R$ 312,80; melhora de R$ 787,00).
> 2. **Revisar:** 4 sem categoria e 1 possível duplicado (“Posto Shell R$ 150,00 em 22/09, lançado pelos dois”), com “Manter um”.
> 3. **Estouros:** Delivery +R$ 212,40 · Restaurantes +R$ 148,00 · Vestuário +R$ 96,00. **Economias:** Combustível −R$ 180,00 · Lanches −R$ 64,50 · Luz −R$ 38,00.
> 4. **Destino da sobra:** Reserva R$ 300 · Férias R$ 100 · fica na conta R$ 74,20.
> 5. **Planejar outubro:** resulta nos Dados de referência, com o combinado “Delivery só no fim de semana”.
>
> **Conclusão:** celebração discreta e “Próximo fechamento: 01/11”.

#### P15 — Desktop: Planejar o orçamento
> 1440×900. Planejamento de novembro/2026 em tabela, com categorias colapsáveis.
> - **Colunas:** Média de 3 meses · Setembro (realizado) · Outubro (orçado / gasto até 14/10) · **Novembro (editável)** · Diferença.
> - **Cabeçalho fixo:** renda, planejado, a distribuir (vai a zero conforme a edição), anel 50/30/20 e chave com/sem ajuda.
> - **Painel lateral:** Futuro (Reserva 300 · Férias 80 · Previdência Isabela 200 · Cota 20), provisões (IPVA 125 · IPTU 100) e o card “13º chega em nov/dez: decidir o destino”.

#### P16 — Desktop: Lançamentos e importação
> 1440×900.
>
> **(A) Tabela densa:**
> - Colunas: Data, Descrição, Categoria, Conta, Para quem, Quem lançou, Natureza, Status, Comprovante, Valor.
> - Filtros salvos.
> - Seleção múltipla com ações em massa: Categorizar, Para quem, Marcar como pago, Excluir.
> - Edição inline e atalhos de teclado (N, /, E).
>
> **(B) Importar extrato em 3 passos:**
> 1. Arrastar o arquivo “Fatura Cartão Panty — set-26.csv”.
> 2. Mapear colunas, com formato de data e vírgula decimal, e prévia de 5 linhas.
> 3. Revisão: 46 linhas → 38 categorizadas (“sugerido”), 5 sem categoria e 3 possíveis duplicadas de lançamentos feitos no celular, lado a lado. O pagamento da fatura é reconhecido como transferência. Botão “Importar 43”.

#### P17 — Mobile e desktop: Futuro (reserva, metas, provisões, renda extra)
> Dois frames 390×844 + um frame 1440×900.
>
> **Reserva:** R$ 7.600, com os marcos 1 mês R$ 9.000 (84%) · 3 meses R$ 27.000 (28%) · 6 meses R$ 54.000 (14%). Simulador:
> - aporte atual R$ 300/mês → marco 1 em mar/2027;
> - R$ 750/mês → 3 meses em dez/2028, com a sugestão “voltar Restaurantes + Delivery ao orçado e cortar 30% libera R$ 270/mês”.
>
> **Metas:**
> - 🏖️ Férias em família: R$ 1.480 de R$ 4.000 até dez/2027 · R$ 80/mês · “abaixo do ritmo: precisa de R$ 180/mês”.
> - 🎓 Previdência da Isabela: R$ 200/mês.
> - 🏦 Cota Unicred: R$ 20/mês.
> - 🚗 Troca do carro: pausada até a reserva chegar a 3 meses.
>
> **Provisões:** IPVA 2027 R$ 1.250 de R$ 1.500 · IPTU 2027 R$ 1.000 de R$ 1.200 · card vazio “Material escolar 2027”. **Plano do 13º:** destino em provisões, reserva e parte livre.
>
> **Renda extra (exemplo):** R$ 0 em outubro · R$ 1.800 no ano, com botão “Lançar renda extra”.
>
> Rodapé fixo: “Conteúdo educativo, não é recomendação de investimento.”

#### P18 — Desktop: Dashboard
> 1440×900. Período “Outubro 2026 · parcial até 14/10” (também Setembro fechado e Últimos 12 meses), filtro de pessoa e chave com/sem ajuda.
>
> **KPIs, cada um com meta e tendência escritas:**
> - Receitas R$ 11.686,50
> - Despesas R$ 4.953,40 (+ R$ 4.290,00 a pagar)
> - Sobra prevista R$ 750,00
> - Taxa de poupança 6,4% (meta 10%)
> - Fixas 59% (referência: até 50%)
> - Comer fora 61% (meta: menos de 40%)
> - Dependência 29%
> - Aderência 91% (10 de 11)
>
> **Gráficos:**
> - Receita × despesa em 12 meses, com linha de saldo; receita na primária e despesa em cinza-ardósia, com rótulos diretos e o mês atual tracejado.
> - Despesas por categoria, com detalhamento.
> - Orçado × realizado.
> - Alimentação em casa × fora.
> - Gastos por pessoa e por meio de pagamento.
> - Projeção de 3 meses (recorrências + parcelas).
>
> **Insights:**
> - “Delivery já passou do orçado: R$ 362,60 de R$ 300, faltando 17 dias.”
> - “Fixas consomem 59% da renda.”
> - “Voltando Restaurantes + Delivery ao orçado e cortando 30% (R$ 900 → R$ 630), sobram R$ 270/mês — R$ 3.240/ano para a reserva.”

#### P19 — Desktop: Visão anual (substitui a planilha)
> 1440×900.
> - **Linhas:** categorias e subcategorias, colapsáveis. **Colunas:** meses + total anual, média e % da receita.
> - **Alternar:** Realizado / Orçado / Diferença.
> - **Meses:** janeiro a setembro fechados; outubro parcial (coluna hachurada, “até 14/10”); novembro e dezembro só com orçado.
> - **Heatmap:** escala de uma única cor; estouro marcado com ícone.
> - **Clicar numa célula:** abre os lançamentos num painel lateral.
> - **Linhas finais:** Receitas, Despesas, Futuro, Saldo do mês, Saldo acumulado.
> - **Botão:** Exportar Excel/CSV.

---
[← Voltar ao README](../README.md)
