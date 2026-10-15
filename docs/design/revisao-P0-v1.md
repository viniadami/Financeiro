# Revisão do P0 — Sistema visual (v1)

Revisão do PDF `P0 - Sistema visual (v1).pdf` (12 páginas, claro e escuro) contra o Prompt 0. Os ajustes viraram o pedido **P0.1** em [`../06-prompts-de-design.md`](../06-prompts-de-design.md).

## Conforme o prompt

- **Cores:** todos os hex batem com o P0. O design acrescentou no modo claro superfície #FFFFFF, superfície sutil #EFECE5, texto secundário #5B6662 e fundos de estado nos dois modos.
- **Contraste AA:** tudo passa. O pior caso é terracota sobre o fundo de estado claro (#F6E1DB), com 4,6:1.
- **Estado nunca só pela cor:** receita "+ ↑", despesa "−", alerta com ⚠, estouro e atraso com "!" e texto. Simulação de deuteranopia e protanopia nos dois modos.
- **Barra de orçamento:** regra de 79%, 80–100% e acima de 100% com hachura terracota; percentual sempre escrito; excedente proporcional. O marcador de limite aparece em todas as barras.
- **Componentes base:** KPI, 13 chips de categoria (56px), avatares V/P, os 4 selos, teclado 3×4, lista por dia com ⋮ como alternativa ao deslizar, bottom nav e sidebar com anel de foco de 3px.
- **Números:** todos batem com os Dados de referência.
- **Tipografia:** Manrope com números tabulares; ícones Material Symbols Rounded.

## Ajustes pedidos no P0.1

1. A tecla "," conflita com a digitação tipo caixa eletrônico do P1: trocar por "00".
2. O sinal de menos varia entre hífen e travessão: padronizar "−" (U+2212).
3. "Seguro do carro" quebra em três linhas: o valor não quebra e o nome trunca.
4. Contas a pagar aparecem como despesas pagas: selo "previsto" e botão "Pagar".
5. Cores de categoria: Lazer & Esporte é um segundo verde; Futuro usa a cor de receita; Presentes e Saúde parecem estouro; três azuis parecidos. Listar os hex das 13 categorias.
6. Contrastes declarados são medidos sobre o fundo, não sobre os cards.

## Faltava mostrar

Texto a 200%, regras de "reduzir movimento", foco visível fora da sidebar, estados de interação e vazio, teto da barra acima de 150% e tokens exportáveis em CSS.
