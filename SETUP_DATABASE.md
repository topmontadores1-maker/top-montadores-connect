# 📊 Criando as Tabelas no Supabase

## 🚀 Passo a Passo

### 1. Acessar o Supabase Dashboard

1. Vá para [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto: `adnabtxgvnqtwyehgmqn`
3. Clique em **SQL Editor** (ícone SQL na barra lateral)

### 2. Criar as Tabelas

#### Opção A: Copiar e colar o SQL (Recomendado)

1. Crie uma **Nova Query**
2. Copie todo o conteúdo de [`supabase/migrations/001_create_tables.sql`](./migrations/001_create_tables.sql)
3. Cole na query do SQL Editor
4. Clique em **Run** (Ctrl+Enter)

#### Opção B: Executar via Supabase CLI

```bash
supabase db push
```

### 3. Seed Inicial (Serviços)

1. Crie outra **Nova Query**
2. Copie o conteúdo de [`supabase/migrations/002_seed_services.sql`](./migrations/002_seed_services.sql)
3. Execute a query

## 📋 Estrutura das Tabelas

### `services` - Serviços disponíveis
```
- slug (TEXT, PK)
- name (TEXT)
- icon (TEXT)
- description (TEXT)
```

### `professionals` - Montadores
```
- id (UUID, PK)
- name (TEXT)
- whatsapp (TEXT)
- photo_url (TEXT)
- city (TEXT)
- state (TEXT)
- email (TEXT)
- doc (TEXT)
- notes (TEXT)
- neighborhoods (TEXT[])
- hours (TEXT)
- status (TEXT: ativo/pausado/pendente)
```

### `professional_services` - Relação many-to-many
```
- id (UUID, PK)
- professional_id (UUID, FK)
- service_slug (TEXT, FK)
```

### `public_links` - Links públicos por serviço/cidade
```
- id (UUID, PK)
- service_slug (TEXT, FK)
- city (TEXT)
- state (TEXT)
- city_slug (TEXT)
- professional_id (UUID, FK)
- url (TEXT)
- status (TEXT: ativo/inativo)
- clicks (INT)
- photo_override (TEXT)
- whatsapp_override (TEXT)
```

### `audit_logs` - Log de auditoria
```
- id (UUID, PK)
- action (TEXT)
- target (TEXT)
- user_id (UUID)
- ip_address (TEXT)
- created_at (TIMESTAMP)
```

## 🔒 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com as seguintes políticas:

- **Services**: Leitura pública, modificação apenas admin
- **Professional**: Leitura pública, modificação apenas admin
- **Public Links**: Leitura pública, modificação apenas admin
- **Audit Logs**: Leitura e criação apenas admin

Admin ID: `070251e6-bb99-4805-9bd9-2166b0193e63`

## ✅ Verificar se as Tabelas Foram Criadas

1. No Supabase Dashboard, vá para **Table Editor**
2. Você deve ver as 6 tabelas listadas:
   - services
   - professionals
   - professional_services
   - public_links
   - cities (opcional, para cobertura por cidade)
   - audit_logs

## 🎯 Próximos Passos

Depois de criar as tabelas, você pode:

1. **Migrar dados mockados** para o banco de dados
2. **Atualizar componentes** para usar dados do Supabase em vez de mocks
3. **Implementar CRUD operations** para gerenciar profissionais

Veja [`src/lib/supabase-queries.ts`](../src/lib/supabase-queries.ts) para exemplos de queries.
