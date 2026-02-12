# AI_CONTEXT.md — Symera

## Como a IA Deve Interpretar o Projeto

### Identidade do Projeto
Symera é uma **plataforma de gestão de eventos** com foco em:
- Colaboração de equipe.
- Planejamento financeiro.
- Checklists inteligentes gerados por regras de negócio (não por chamadas à API OpenAI).
- Design mobile-first em português brasileiro.

### Arquitetura
- **Monolito fullstack**: React (Vite) + Express.js no mesmo repo.
- **Banco**: PostgreSQL no Supabase, ORM Drizzle.
- **Auth**: Supabase Auth com JWT (Google OAuth), dev tokens em desenvolvimento.
- **Deploy**: Vercel (frontend estático + serverless functions para API).

### Princípios de Código
- TypeScript com strict mode.
- Schema-first: tudo começa em `shared/schema.ts`.
- Toda operação de dados via `IStorage` (nunca acessar `db` diretamente nas rotas).
- Validação com Zod em todas as entradas.
- UI com shadcn/ui + Tailwind CSS.
- Estado do servidor via TanStack Query (não usar estado global).

## Limitações Conhecidas

| Limitação | Impacto | Contexto |
|-----------|---------|----------|
| **JWT sem verificação de assinatura** | Backend aceita qualquer JWT com formato válido | Segurança |
| **Filesystem efêmero na Vercel** | Uploads são perdidos entre deploys/invocações | Uploads |
| **MemoryCache resetado em cold starts** | Cache in-process não persiste | Performance |
| **routes.ts tem 3900+ linhas** | Arquivo difícil de navegar | Manutenibilidade |
| **Sem testes automatizados** | Apenas `routes.test.ts` com conteúdo mínimo | Qualidade |
| **Sem rate limiting** | API vulnerável a abuso | Segurança |
| **Campo `assigneeId` legado na tabela `tasks`** | Usar `task_assignees` em vez disso | Schema |
| **Páginas duplicadas** | `EventDetailNew.tsx`, `EventDetailRefactored.tsx`, `Team.tsx`, `Team.fixed.tsx` | Frontend |

## Partes Sensíveis do Sistema

### 🔴 Máxima Cautela
| Área | Arquivo | Razão |
|------|---------|-------|
| **Autenticação** | `server/supabaseAuth.ts` | Middleware de autenticação — qualquer erro expõe dados |
| **Resolução de ID** | `supabaseAuth.ts:getEffectiveUserId` | Mapeia UUID Supabase → ID do banco. Erro = dados de outro usuário |
| **Verificação de acesso** | `server/routes.ts` (em cada rota) | `isOwner` + `isTeamMember` — bypass = acesso indevido |
| **Migração de usuário** | `server/routes.ts:force-migration` | Altera ownership de dados — irreversível |
| **Schema do banco** | `shared/schema.ts` | Mudanças afetam todo o sistema |

### 🟡 Cautela Moderada
| Área | Arquivo | Razão |
|------|---------|-------|
| **Storage layer** | `server/storage.ts` | Abstrai todos os acessos ao banco |
| **Auth Manager** | `client/src/lib/auth.ts` | Gerencia tokens e sessão no frontend |
| **Query Client** | `client/src/lib/queryClient.ts` | Configura cache e retry para toda a app |
| **Upload de arquivos** | `server/routes.ts` (multer config) | Validação de tipo e tamanho |
| **Feedback público** | Rotas de feedback | Única área pública sem autenticação |

## Áreas que Exigem Extrema Cautela

### 1. Ao Modificar Autenticação
- **Nunca** remover o middleware `isAuthenticated` de rotas protegidas.
- **Nunca** expor `SESSION_SECRET`, `DATABASE_URL` ou `SUPABASE_ANON_KEY` em logs client-side.
- **Sempre** testar com tokens válidos E inválidos.
- **Atenção** ao `getEffectiveUserId`: a lógica de resolução de ID é crítica para associar dados ao usuário correto.

### 2. Ao Modificar o Schema
- **Sempre** verificar impacto no `storage.ts` (queries que usam a tabela).
- **Nunca** renomear colunas sem migration — `db:push` pode dropar e recriar.
- **Sempre** manter backwards compatibility nos tipos exportados.
- **Sempre** atualizar `DATABASE_SCHEMA.md` após mudanças.

### 3. Ao Modificar Rotas
- **Sempre** manter validação Zod nos inputs.
- **Sempre** verificar acesso (owner/team member) em rotas de evento.
- **Sempre** adicionar activity log para mutações.
- **Nunca** retornar `error.stack` em produção.

### 4. Ao Modificar Frontend
- **Sempre** usar `useAuth()` para verificar autenticação.
- **Sempre** testar em viewport mobile (< 768px).
- **Nunca** armazenar dados sensíveis em estado global.
- **Sempre** usar TanStack Query para dados do servidor.

## Padrões Obrigatórios que a IA Deve Seguir

### Na hora de gerar código:
1. **TypeScript**: Todo código deve ser TypeScript com tipos explícitos.
2. **Zod**: Toda entrada de dados deve ter schema de validação Zod.
3. **IStorage**: Operações de banco devem usar a interface IStorage, nunca `db` direto.
4. **isAuthenticated**: Toda rota nova que não é pública deve ter o middleware.
5. **Activity Log**: Toda mutação deve gerar log em `activity_logs`.
6. **Error Handling**: Try/catch com tratamento de ZodError separado.
7. **Tailwind**: Estilização deve usar classes Tailwind, nunca CSS inline.
8. **Português**: Mensagens de UI em português brasileiro.
9. **Mobile-first**: Todo componente deve ser responsivo.
10. **Sem any**: Evitar `any`; se inevitável, documentar a razão.

### Na hora de refatorar:
1. **Não quebrar rotas existentes** — manter backwards compatibility.
2. **Não remover campos do banco** sem migration planejada.
3. **Não alterar lógica de resolução de ID** sem testes extensivos.
4. **Preferir extrair módulos** de `routes.ts` em vez de adicionar mais código.
5. **Atualizar documentação** sempre que alterar regras de negócio ou APIs.

### Na hora de investigar bugs:
1. Verificar **qual ID** está sendo usado (Supabase UUID vs ID legado).
2. Verificar **cache** — dados podem estar desatualizados (TTL do MemoryCache).
3. Verificar **localStorage** — frontend pode usar dados obsoletos.
4. Verificar **status do Supabase** — auth e database podem estar fora.
5. Verificar **cold start** — primeira invocação serverless é mais lenta.

### Documentos de Referência
Antes de fazer alterações significativas, consultar:
- `BUSINESS_RULES.md` — para regras de negócio.
- `API_CONTRACTS.md` — para contratos de API.
- `DATABASE_SCHEMA.md` — para schema do banco.
- `SECURITY.md` — para implicações de segurança.
- `DEV_GUIDELINES.md` — para padrões de código e PR checklist.

---

*Última atualização: 12/02/2026*
