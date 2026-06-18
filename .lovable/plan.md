
# Top Montadores — Plano de Implementação (UI)

Escopo: somente frontend com dados mockados. Sem backend, sem chaves de API, sem conexão a banco. Foco em layout profissional, responsivo e voltado para conversão via WhatsApp.

## Stack e fundamentos

- TanStack Start (já configurado), Tailwind v4, shadcn/ui.
- Fonte Nunito carregada via `<link>` no `__root.tsx` (preconnect + Google Fonts), registrada em `@theme` como `--font-sans`.
- Tokens em `src/styles.css`:
  - `--primary: oklch(...)` ≈ `#294380`
  - `--secondary: oklch(...)` ≈ `#2A4481`
  - Tons auxiliares: surface, muted, border, success (verde WhatsApp para CTA), foreground.
- Componentes reutilizáveis em `src/components/` (Logo, Header, Footer, ServiceCard, ProfessionalCard, WhatsAppButton, SearchForm, EmptyState, ErrorState, LoadingState, DataTable, StatCard, Sidebar, Modal wrappers).
- Mock data em `src/mocks/` (montadores, serviços, cidades, métricas).
- SEO: `head()` por rota com title/description/OG distintos.

## Estrutura de rotas

```
src/routes/
  __root.tsx               (HeadContent + fonte Nunito + Outlet)
  index.tsx                (Home pública)
  s.$servico.$cidade.tsx   (Página de serviço por cidade — ex: /s/instalacao-tv/balneario-camboriu-sc)
  montador.tsx             (Layout “Sou montador” — landing simples)
  admin.tsx                (Layout do painel com Sidebar + Outlet)
  admin.index.tsx          (Dashboard)
  admin.montadores.tsx     (Lista de montadores)
  admin.montadores.$id.tsx (Detalhe com abas)
  admin.links.tsx          (Links e Cobertura)
  admin.servicos.tsx
  admin.importacoes.tsx    (Importação de planilha)
  admin.cidades.tsx
  admin.relatorios.tsx
  admin.configuracoes.tsx
  admin.auditoria.tsx
```

Observação: o painel admin é puramente visual (sem autenticação real), apenas demonstrativo.

## 1. Home pública (`/`)

- Header fixo: Logo “Top Montadores” à esquerda, navegação enxuta e botão `Sou montador` (variant secondary/outline) à direita.
- Hero centralizado:
  - H1: “Encontre um montador perto de você”
  - Subtítulo curto de confiança.
  - Formulário em card branco com shadow:
    - Input “Qual serviço você precisa?” (com ícone)
    - Input “Cidade ou estado” (com ícone)
    - Botão primário “Buscar montador” (cor primária, full em mobile)
    - Botão secundário “Usar minha localização” (ghost/outline, ícone de pin)
- Grid responsivo de tipos de serviço (8–12 cards com ícone + nome): Instalação de TV, Montagem de móveis, Guarda-roupa, Cozinha planejada, Persianas, Suporte/prateleira, Berço, Escritório, etc.
- Bloco de confiança: 3–4 selos/benefícios (Profissionais verificados, Atendimento local, Resposta rápida no WhatsApp, Cobertura nacional) + faixa com números mockados.
- Footer institucional: colunas (Sobre, Para clientes, Para montadores, Legal), redes sociais, copyright.

Estados: form com validação leve, loading no botão de busca, empty/erro reservados para tela de resultado (fora deste escopo inicial — busca leva à página de serviço/cidade simulada).

## 2. Página de serviço por cidade (`/s/$servico/$cidade`)

- Breadcrumb: Home / Serviços / {Serviço} / {Cidade, UF}
- H1 dinâmico: “Instalação de TV em Balneário Camboriú, SC” (derivado dos params + mock).
- Card único de profissional responsável (sem ranking, sem destaques, sem busca por nome):
  - Foto circular, nome, badge “Profissional responsável nesta cidade”.
  - Lista de serviços atendidos (chips).
  - Horário de atendimento e cidade/UF.
  - CTA primário grande: “Chamar no WhatsApp” (verde, ícone WhatsApp, abre `https://wa.me/...` com mensagem pré-preenchida).
  - CTA secundário: “Compartilhar link” (usa `navigator.share` com fallback para copiar URL + toast).
- Bloco “Serviços relacionados” na mesma cidade (chips/cards que linkam para outras combinações).
- Conteúdo local SEO: 2–3 parágrafos sobre o serviço naquela cidade, FAQ curta (accordion), bairros atendidos.
- `head()` com title/description/OG dinâmicos por serviço+cidade. og:image apenas se houver foto do profissional.
- Estados: loading skeleton do card, empty (“Em breve nesta cidade” + CTA de cadastro), erro (boundary com retry).

Explicitamente fora: ranking, lista de profissionais, busca por nome.

## 3. Painel administrativo (`/admin/*`)

Layout: Sidebar fixa colapsável (shadcn sidebar) + área principal com header simples (título da página + ações).

Itens da sidebar (ícones lucide): Dashboard, Montadores, Links e Cobertura, Serviços, Importações, Cidades, Relatórios, Configurações, Auditoria.

### Dashboard (`/admin`)
- 4–6 StatCards: Total de montadores, Cidades cobertas, Links ativos, Cliques WhatsApp (7d), Importações no mês, Pendências.
- 2 gráficos mockados (linha de cliques e barras por estado) usando Recharts.
- Lista “Últimas atividades” (auditoria resumida).

### Montadores (`/admin/montadores`)
- Filtros: busca, estado, cidade, status (ativo/inativo/pendente), faixa de nº de links.
- DataTable responsiva (cards em mobile) com colunas: Foto, Nome, WhatsApp, Cidade, Estado, Nº de links, Status (badge), Ações (ver, editar, substituir, desativar).
- Toolbar com botões: “Novo montador”, “Atualização global” (abre modal foto/WhatsApp), “Substituir profissional” (abre modal de substituição em todos os links).
- Estados: loading (skeleton de linhas), vazio (ilustração + CTA), erro (retry).

### Detalhe do montador (`/admin/montadores/$id`)
Tabs (shadcn Tabs):
1. Dados gerais — foto, nome, WhatsApp, e-mail, documento, status, observações.
2. Cobertura e serviços — multi-select de serviços, cidades atendidas (chips com add/remove), horário.
3. Links públicos — tabela com slug, serviço, cidade, URL pública, cliques, ações (copiar, abrir, desativar).
4. Histórico — timeline de alterações (auditoria do registro).

### Modais
- Atualização global de foto e WhatsApp: form com upload de imagem (preview) + input de WhatsApp com máscara, aviso “Será aplicado em todos os links públicos deste montador”, confirmação.
- Substituição de profissional em todos os links: seletor do montador atual → seletor do novo montador, preview do impacto (X links em Y cidades), confirmação dupla.

### Links e Cobertura (`/admin/links`)
- Tabela: serviço, cidade/UF, montador responsável, URL, status, cliques. Filtros por serviço/estado/sem cobertura.

### Serviços / Cidades / Relatórios / Configurações / Auditoria
- Serviços: CRUD visual com ícone, nome, slug, ativo.
- Cidades: lista com UF, status de cobertura, montador responsável.
- Relatórios: filtros de período + cards e tabela exportável (mock).
- Configurações: tela com seções (Marca, Mensagens padrão de WhatsApp, Domínios, Integrações — todas visuais).
- Auditoria: tabela de eventos (quem, quando, o quê, antes/depois).

### Importação de planilha (`/admin/importacoes`)
- Upload (drag-and-drop) de CSV/XLSX.
- Preview em tabela das primeiras N linhas.
- Validações por coluna (obrigatórios, formato de WhatsApp, UF válida, serviço existente).
- Coluna “Status da linha”: OK / Aviso / Erro, com tooltip da mensagem.
- Resumo no topo: total, válidas, com aviso, com erro.
- Botão “Importar válidas” (apenas simula com toast), “Baixar erros”.
- Histórico de importações abaixo.

## Componentes reutilizáveis chave

- `Logo`, `Header`, `Footer`, `SearchForm`
- `ServiceIconCard`, `ProfessionalCard`, `WhatsAppCTA`, `ShareButton`
- `PageHeader`, `Breadcrumbs`, `Section`
- `DataTable` (com mobile cards), `Toolbar`, `FilterBar`
- `StatCard`, `EmptyState`, `ErrorState`, `LoadingSkeleton`
- `AdminSidebar`, `AdminShell`
- Wrappers de Dialog/Sheet para os modais

## Detalhes técnicos

- Cores via tokens em `@theme inline` apontando para variáveis em `:root` (oklch equivalentes a `#294380` e `#2A4481`); botões usam `bg-primary`/`bg-secondary` — nada de cores hard-coded em componentes.
- Botão WhatsApp usa token semântico `--whatsapp` (verde) declarado no design system.
- Nunito: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap">` no `__root.tsx`; `@theme { --font-sans: "Nunito", sans-serif; }`.
- Cada rota define `head()` próprio com title/description/OG distintos; rota de serviço/cidade gera meta dinâmica a partir dos params.
- Nenhuma chamada a banco, nenhuma chave de API. Dados vêm de `src/mocks/`. Formulários apenas simulam ações com toasts (`sonner`).
- Acessibilidade: labels em todos os inputs, foco visível, contraste validado, navegação por teclado nos modais.
- Responsividade: mobile-first; tabelas viram cards no mobile; sidebar do admin colapsa para ícones e abre como sheet no mobile.

## Fora de escopo (não será feito)

- Autenticação real do admin.
- Persistência, APIs, integrações (Supabase, edge functions, etc.).
- Ranking, profissionais em destaque ou busca por nome na página de serviço.

## Entregáveis

- Home, página de serviço/cidade e todas as telas/abas/modais do painel admin navegáveis com dados mockados, prontas para futura integração.
