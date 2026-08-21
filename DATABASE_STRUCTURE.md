# 🗄️ Estrutura do Banco de Dados - Top Montadores

## 📌 Resumo

Criamos toda a estrutura de tabelas, tipos TypeScript e helpers para começar a usar o Supabase em vez dos dados mockados.

## 📂 Arquivos Criados

### 1. **Migrações SQL**
- `supabase/migrations/001_create_tables.sql` - Criar todas as 6 tabelas com RLS
- `supabase/migrations/002_seed_services.sql` - Inserir 12 serviços iniciais

### 2. **Types TypeScript**
- `src/integrations/supabase/database.types.ts` - Types para todas as tabelas

### 3. **Query Helpers**
- `src/lib/supabase-queries.ts` - Funções para CRUD operations

### 4. **Documentação**
- `SETUP_DATABASE.md` - Instruções passo a passo

## 🚀 Próximos Passos

### 1️⃣ Criar as Tabelas (3 minutos)

**Via Supabase Dashboard:**

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Crie uma **Nova Query**
5. Copie o conteúdo de `supabase/migrations/001_create_tables.sql`
6. Clique em **Run** (Ctrl+Enter)
7. Copie o conteúdo de `supabase/migrations/002_seed_services.sql`
8. Execute novamente

**Ou via Supabase CLI:**

```bash
supabase db push
```

### 2️⃣ Verificar as Tabelas

No Supabase Dashboard, vá para **Table Editor**. Você deve ver:

✅ services (12 serviços pre-carregados)
✅ professionals (vazio - pronto para dados)
✅ professional_services (vazio)
✅ public_links (vazio)
✅ cities (vazio)
✅ audit_logs (vazio)

### 3️⃣ Atualizar Componentes

Para parar de usar dados mockados e começar a usar o Supabase:

**Exemplo: Dashboard com dados reais**

```typescript
import { getDashboardStats, getAuditLogs } from '@/lib/supabase-queries';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getAuditLogs(8),
    ]).then(([stats, logs]) => {
      setStats(stats);
      setLogs(logs);
    });
  }, []);

  // Use stats and logs instead of mockData
}
```

## 📊 Estrutura das Tabelas

### services
```sql
- slug (TEXT, PK)
- name (TEXT, UNIQUE)
- icon (TEXT)
- description (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```
**Dados:** 12 serviços pre-carregados

### professionals
```sql
- id (UUID, PK)
- name (TEXT)
- whatsapp (TEXT)
- photo_url (TEXT, nullable)
- city (TEXT)
- state (TEXT)
- email (TEXT, nullable)
- doc (TEXT, UNIQUE, nullable)
- notes (TEXT, nullable)
- neighborhoods (TEXT[] ARRAY)
- hours (TEXT, nullable)
- status (TEXT) - 'ativo', 'pausado', 'pendente'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### professional_services (Many-to-Many)
```sql
- id (UUID, PK)
- professional_id (UUID, FK → professionals)
- service_slug (TEXT, FK → services)
- UNIQUE(professional_id, service_slug)
```

### public_links
```sql
- id (UUID, PK)
- service_slug (TEXT, FK → services)
- city (TEXT)
- state (TEXT)
- city_slug (TEXT)
- professional_id (UUID, FK → professionals)
- url (TEXT)
- status (TEXT) - 'ativo', 'inativo'
- clicks (INT)
- photo_override (TEXT, nullable)
- whatsapp_override (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### cities
```sql
- id (UUID, PK)
- city (TEXT)
- state (TEXT)
- slug (TEXT)
- professional_id (UUID, FK → professionals, nullable)
- UNIQUE(city, state, slug)
```

### audit_logs
```sql
- id (UUID, PK)
- action (TEXT)
- target (TEXT)
- user_id (UUID, nullable)
- ip_address (TEXT, nullable)
- created_at (TIMESTAMP)
```

## 🔒 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

| Tabela | Leitura | Modificação |
|--------|---------|-------------|
| services | Pública ✅ | Admin only 🔒 |
| professionals | Pública ✅ | Admin only 🔒 |
| professional_services | Pública ✅ | Admin only 🔒 |
| public_links | Pública ✅ | Admin only 🔒 |
| cities | Pública ✅ | Admin only 🔒 |
| audit_logs | Admin only 🔒 | Admin only 🔒 |

**Admin ID:** `070251e6-bb99-4805-9bd9-2166b0193e63`

## 💾 Migração de Dados Mockados

Para migrar os dados mockados para o banco:

1. Acesse `src/mocks/data.ts` para ver os dados
2. Use `src/lib/supabase-queries.ts` para inserir
3. Atualize os componentes para usar `getters` em vez de `mockData`

## 🎯 Exemplo de Integração

### Antes (Com Mocks)
```typescript
import { professionals as seedProfessionals } from '@/mocks/data';

function MontadoresList() {
  return (
    <div>
      {seedProfessionals.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

### Depois (Com Supabase)
```typescript
import { getProfessionals } from '@/lib/supabase-queries';

function MontadoresList() {
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    getProfessionals().then(setProfessionals);
  }, []);

  return (
    <div>
      {professionals.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

## 📚 Recursos Úteis

- [Supabase Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)

## ✅ Checklist

- [ ] Criar as tabelas via SQL Editor ou Supabase CLI
- [ ] Verificar que 6 tabelas aparecem no Table Editor
- [ ] Conferir que `services` tem 12 registros
- [ ] Atualizar componentes para usar `supabase-queries`
- [ ] Implementar CRUD para profissionais
- [ ] Testar login e auditoria

---

**Próxima etapa:** Criar um endpoint para listar montadores e migrar a página `/admin/montadores` para usar dados do Supabase.
