# Lançamento por foto e cofre de comprovantes

**O que faz:** você fotografa o cupom do mercado, ou importa o print do comprovante de PIX, e o app preenche o lançamento sozinho (estabelecimento, CNPJ, data e hora, valor, forma de pagamento, final do cartão, recebedor do PIX, itens). Você confere e confirma, e **a imagem fica guardada junto do lançamento**.

**Fluxo (sempre com revisão humana)**
1. **Capturar:** câmera com moldura e modos *Cupom/Nota · Comprovante PIX · Boleto · Galeria/print*. A imagem é comprimida e recortada no celular (lado maior até ~2.500 px, ~300 KB). Sem internet, fica na fila e é processada depois.
2. **Ler sem IA primeiro (exato e grátis):**
   - **QR Code da NFC-e:** leva à consulta pública da SEFAZ do estado, com itens, valores e CNPJ oficiais. Usar quando o portal permitir leitura automática (varia por estado).
   - **Código de barras do boleto:** valor e vencimento decodificados no próprio app.
3. **Ler com IA (API do Claude)** quando os passos acima não bastam: cupom amassado, PIX, recibo de consulta. A chamada roda **no servidor** (função do Supabase ou rota do Next.js), nunca com a chave no celular. A resposta vem em JSON validado por esquema (*structured outputs*), com confiança por campo.
4. **Sugerir:** categoria por regras do casal e pelo histórico (ex.: o mesmo recebedor de PIX → “Saúde › Terapia”, com “lembrar para este recebedor”). Cupom de mercado pode ser **dividido por categoria** (Alimentação, Limpeza, Higiene).
5. **Revisar e confirmar:** campos de baixa confiança destacados com “confira”.
6. **Evitar duplicidade:** hash da imagem, chave de 44 dígitos da NFC-e, **ID E2E do PIX** (casa com o extrato importado depois) e valor + data ±3 dias. Exemplo: “A Panty já lançou R$ 287,35 hoje — vincular a foto a esse lançamento?”

**Cofre de comprovantes:** todo lançamento pode ter anexos (foto ou PDF). Há uma galeria com busca (estabelecimento, valor, data, tipo) e etiquetas como **“Dedutível no IR”** (saúde e educação) e **“Garantia até…”** (notas de eletrônicos), além de “aguardando revisão”. Dá para exportar um ZIP do ano ou o **pacote do IR**.

**Custo e limites (estimativa para planejamento)**
- **IA:** com o modelo mais capaz do Claude, ~US$ 0,02–0,06 por foto, ou ~US$ 2–5/mês para 60–100 fotos. Um modelo menor sai dezenas de vezes mais barato. **Decidam depois de testar os dois em ~30 comprovantes reais.** QR da NFC-e e boleto não usam IA.
- **Armazenamento:** imagens a ~300 KB dão ~3 mil comprovantes por GB. O plano gratuito do Supabase tem ~1 GB de arquivos (conferir).
- **Privacidade:** comprovantes têm nomes e CPF parcial. Bucket privado, link temporário e envio à IA só da imagem necessária (conferir a política de retenção da API).
- **iPhone:** um PWA não aparece no “Compartilhar” de outros apps (hoje; conferir), então o fluxo é print → abrir o app → importar da galeria. **No Android, dá para compartilhar o comprovante direto do app do banco.**

**Onde entra no roadmap:** anexar foto ao lançamento na **Fase 1b**; lançar por foto (PIX, total do cupom, boleto, QR da NFC-e) e o cofre na **Fase 2**; itens do cupom, histórico de preços dos produtos (“inflação da casa”) e compartilhar do app do banco na **Fase 5**. *Se for prioridade, a Fase 2 de foto pode vir logo depois da 1b.*

---
[← Voltar ao README](../README.md)
