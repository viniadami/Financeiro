# Arquitetura e roadmap

## Arquitetura (decidida: PWA)

- **Um único app web responsivo, instalável no celular (PWA):** o mesmo código para celular e desktop, sem loja de apps e com atualização instantânea.
- **Frontend:** React + TypeScript (Next.js), Tailwind + shadcn/ui, gráficos com Recharts/ECharts. **Backend:** Supabase (Postgres, login, RLS, tempo real, Storage, Edge Functions), projeto na região São Paulo. **Hospedagem:** Vercel.
- **Offline para lançar (Fase 1):** o lançamento vai para uma fila local (IndexedDB), com identificador gerado no aparelho, e é enviado ao abrir o app ou ao voltar a conexão. O envio é idempotente, então não duplica. “Salvar” nunca trava, e um selo mostra “aguardando sincronizar (2)”. **Teste de aceite:** no modo avião, lançar 3 gastos → fechar o app → reabrir com rede → os 3 aparecem no outro celular, sem duplicar.
- **Restrições do iPhone:**
  - Login por **código de 6 dígitos por e-mail**, senha ou passkey; nunca só link mágico, que abre no Safari, fora do app instalado.
  - O onboarding ensina a instalar (Safari → Compartilhar → Adicionar à Tela de Início).
  - Push só funciona com o app instalado, enviado por Web Push a partir de uma função agendada no servidor. Todo aviso aparece também dentro do app.
  - Na 1ª semana, testar instalação, login, câmera e push nos celulares reais dos dois.
- **Segurança e dados (não negociável):**
  - RLS em **todas** as tabelas, com teste automatizado de que um usuário de fora não lê nada.
  - Cadastro só por convite. Arquivos em bucket privado. Chave de serviço nunca no front.
  - **Backup próprio** semanal (`pg_dump` criptografado via GitHub Actions) + botão “Exportar tudo”, já que o plano gratuito não tem backup restaurável (conferir). Testar uma restauração por trimestre.
  - Modo discreto (esconder valores) e PIN opcional.
- **IA:** a leitura de comprovantes ([detalhes](03-lancamento-por-foto.md)) roda numa função do servidor com a API do Claude. Depois, lançamento por texto ou voz (“mercado 230 no cartão”).
- **Open Finance:** só via agregador (ex.: Pluggy, Belvo), depois de avaliar custo, termos e renovação do consentimento. Não há acesso direto para um app pessoal.

## Roadmap

| Fase | Entrega | Objetivo |
|---|---|---|
| **0 — Preparação** (1–2 semanas, sem código) | Combinados do casal, categorias, inventário, 3 meses de extratos, plano do 13º, design | Base para o orçamento inicial |
| **1a — Lançar e ver** (2–3 semanas) | Login por convite, família, lançamento rápido com fila offline, categorias, contas e cartões básicos, lista do mês com busca, resumo por grupo, importação única do “Registro Diário”, PWA instalável | Os dois lançando todo dia |
| **1b — Orçar** (+2–3 semanas) | Orçamento por grupo, contas do mês e recorrências, transferência, parcelado, dinheiro livre privado, “Futuro” no orçamento, **anexar foto/PDF ao lançamento** | Orçado × realizado |
| **2 — Ritual + Foto** | Fechamento mensal guiado, conferência de saldo, importação CSV/OFX com conciliação, provisões e plano anual, **lançar por foto** (PIX, total do cupom, boleto, QR da NFC-e), **cofre de comprovantes** | Mudar o comportamento |
| **3 — Análise desktop** (com ≥ 3 meses de dados) | Dashboard, visão anual, lançamentos em tabela com edição em massa, exportar Excel | Ver padrões |
| **4 — Patrimônio** | Metas, reserva com projeção, renda extra por projeto, registro de investimentos, resumo para o IR | De controlar para construir |
| **5 — Inteligência** | Itens do cupom e histórico de preços, texto/voz, compartilhar do app do banco (Android), Open Finance via agregador, insights automáticos | Atrito perto de zero |

**Para avançar de fase:** 3 semanas seguidas com cobertura de pelo menos 80%, lançada pelos dois.

---
[← Voltar ao README](../README.md)
