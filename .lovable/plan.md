## Objetivo

Evoluir o painel admin do "Top Montadores" para cobrir os requisitos de **cadastro/gestão**, **atualização global** e **substituição de profissional**, mantendo o trabalho 100% no frontend com mock data (sem backend, sem chaves).

---

## 1. Cadastro e gestão de montadores

### 1.1 Cadastro manual
- Novo botão **"Novo montador"** na toolbar de `/admin/montadores`.
- Abre `Dialog` com formulário (react-hook-form + zod):
  - Nome, WhatsApp (normalizado com máscara), e-mail, doc, foto (URL), cidade, UF, bairros, horário, serviços (multi-select), status (ativo/pausado/pendente), observações.
- Validações: nome obrigatório, WhatsApp BR válido, UF de 2 letras, ao menos 1 serviço.
- Submit → adiciona ao store mock e exibe `toast.success`.

### 1.2 Importação por planilha
- Já existe `/admin/importacoes` com preview. Apenas reforçar:
  - Link direto a partir do botão **"Importar planilha"** na tela de montadores.
  - Após "Importar válidas", redireciona para a lista com toast somando linhas importadas.

### 1.3 Pesquisa avançada
Refatorar a toolbar de `/admin/montadores` para filtrar por:
- Texto livre (nome **ou** WhatsApp).
- Cidade (combobox).
- Estado/UF (select).
- Serviço (select, baseado em `services`).
- Status (Ativo / Pausado / Pendente / Todos).
- Botão "Limpar filtros". Estado vazio dedicado quando nada bate.

### 1.4 Links vinculados ao montador
Na rota `/admin/montadores/$id`, aba **"Links públicos"**:
- Tabela com todos os `publicLinks` onde `professionalId === id`.
- Colunas: Serviço, Cidade/UF, URL, Status, Cliques, Ações (abrir, copiar).
- Estado vazio: "Este montador ainda não tem links."

### 1.5 Pausar profissional (soft)
- Substituir a noção atual de "inativo" por **"pausado"** (preserva histórico).
- Ação **"Pausar"** / **"Reativar"** na tabela e na tela de detalhe.
- Confirmação via `AlertDialog` informando: "Os links continuarão existindo, mas exibirão aviso de profissional indisponível. Nenhum dado é apagado."
- Badge de status com cor própria.

---

## 2. Atualização global (foto / WhatsApp)

### 2.1 Modelo mock
No mock, adicionar a cada `PublicLink` os campos opcionais:
- `photoOverride?: string | null`
- `whatsappOverride?: string | null`

Se `null/undefined`, o link **herda** do profissional (sem exceção configurada).

### 2.2 Modal "Atualização global"
Refatorar o modal existente para um fluxo em 2 passos:
1. **Selecionar campo**: Foto, WhatsApp, ou ambos. Inputs com preview.
2. **Confirmação com impacto**:
   - Contador: *"Esta alteração afetará **N links** (M sem exceção configurada). X links têm exceção e não serão alterados."*
   - Lista resumida (até 5 + "ver mais") dos links impactados.
   - Botões: Cancelar / Confirmar atualização.
3. Aplicar → atualiza profissional no store, links sem override refletem automaticamente, toast e entrada em auditoria.

### 2.3 Indicação de exceção
Na aba "Links públicos" do detalhe, badge **"Exceção"** quando o link tem override, com link "Remover exceção".

---

## 3. Substituição de profissional

### 3.1 Regras
- Mantém URLs/slugs existentes (`/s/$servico/$cidade`).
- Apenas troca o `professionalId` nos links selecionados.
- Escopos de substituição:
  - Todos os links do profissional A → profissional B.
  - Subconjunto por cidade/UF/serviço (filtros dentro do modal).

### 3.2 Modal "Substituir profissional"
1. Selecionar profissional **origem** (autocomplete).
2. Selecionar profissional **destino** (autocomplete, exibe serviços/cidades cobertos para alerta de mismatch).
3. Filtros opcionais (cidade, serviço).
4. Preview: tabela "X links serão transferidos. Y links foram excluídos por filtro."
5. Avisos quando destino não cobre o serviço/cidade do link (badge "Atenção", não bloqueia).
6. Confirmar → atualiza store, dispara toast e auditoria.

### 3.3 Auditoria
Adicionar entradas em `auditLog` para:
- Atualização global de foto/WhatsApp (com contagem).
- Substituição de profissional (origem → destino, N links).
- Pausar/reativar montador.
- Cadastro manual e importação concluída.

Aba **"Histórico"** do detalhe do montador exibe somente eventos cujo `target` é o próprio montador.

---

## Detalhes técnicos

- **Store mock reativo**: criar `src/mocks/store.ts` com `zustand` (já comum no projeto via shadcn? se não estiver, usar `bun add zustand`) para tornar profissionais, links e auditoria mutáveis em runtime e refletir entre telas.
- **Componentes novos**:
  - `src/components/admin/montador-form.tsx` (cadastro/edição).
  - `src/components/admin/global-update-modal.tsx` (refator, 2 passos).
  - `src/components/admin/replace-professional-modal.tsx` (refator com filtros + preview).
  - `src/components/admin/links-table.tsx` (reaproveitável em detalhe e em `/admin/links`).
  - `src/components/admin/status-badge.tsx`.
- **Tipos**: estender `Professional.status` para `"ativo" | "pausado" | "pendente"` e migrar usos atuais de `"inativo"`.
- **Validação**: `zod` + `react-hook-form` em todos os formulários.
- **Sem backend**: nenhuma chamada Supabase, nenhum env, nenhuma chave. Toda mutação é em memória + toast.
- **Acessibilidade**: foco automático no primeiro campo do modal, descrições em `AlertDialog`, labels associadas.
- **Estados**: loading (skeleton em tabelas), vazio (mensagens dedicadas), erro (boundary nas rotas afetadas).

## Fora do escopo
- Autenticação real, persistência, integração com WhatsApp Business API, envio de planilha real ao servidor, ranking/SEO.
