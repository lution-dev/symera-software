# DEV_GUIDELINES.md — Symera

## Convenções de Código

### TypeScript
- **Strict mode** habilitado no `tsconfig.json`.
- Usar `type` imports para tipos (`import type { Express } from 'express'`).
- Nunca usar `any` sem justificativa documentada em comentário.
- Preferir `const` sobre `let`; nunca usar `var`.
- Nomes de variáveis e funções em **camelCase** (inglês).
- Nomes de componentes React em **PascalCase**.
- Mensagens de UI e comentários em **português brasileiro**.

### React
- Componentes funcionais com hooks (nunca classes).
- Uma page por arquivo em `client/src/pages/`.
- Componentes reutilizáveis em `client/src/components/`.
- Componentes shadcn/ui em `client/src/components/ui/`.
- Hooks customizados em `client/src/hooks/`.
- Estado do servidor via TanStack Query — **não usar** `useState` para dados da API.
- Formulários com `react-hook-form` + `zod` resolver.

### Backend
- Todas as rotas dentro de `registerRoutes()` em `server/routes.ts` (ou módulos de rotas separados).
- Toda operação de banco de dados via `IStorage` interface (`server/storage.ts`).
- Nunca acessar `db` diretamente nas rotas — usar `dbStorage`.
- Validar todos os inputs com Zod antes de processar.
- Logar erros com `console.error`, infos com `console.log` usando prefixos (`[Auth]`, `[Draft]`, etc.).

## Estrutura de Pastas

```
/
├── client/                     # Frontend React
│   ├── index.html              # HTML entry point
│   └── src/
│       ├── App.tsx             # Roteamento principal
│       ├── main.tsx            # Bootstrap React
│       ├── index.css           # CSS global + variáveis
│       ├── assets/             # Imagens e assets estáticos
│       ├── components/         # Componentes reutilizáveis
│       │   └── ui/             # shadcn/ui components
│       ├── hooks/              # Hooks customizados
│       │   ├── useAuth.ts      # Hook de autenticação
│       │   ├── use-mobile.tsx  # Hook de detecção mobile
│       │   └── use-toast.ts    # Hook de notificações
│       ├── lib/                # Utilitários e configs
│       │   ├── auth.ts         # AuthManager (singleton)
│       │   ├── supabase.ts     # Cliente Supabase
│       │   ├── queryClient.ts  # TanStack Query config
│       │   └── utils.ts        # Funções auxiliares
│       └── pages/              # Páginas da aplicação
│           ├── Auth.tsx        # Login
│           ├── Dashboard.tsx   # Painel principal
│           ├── Events.tsx      # Lista de eventos
│           └── ...             # Demais páginas
├── server/                     # Backend Express
│   ├── index.ts                # Entry point do servidor
│   ├── routes.ts               # Rotas principais da API
│   ├── storage.ts              # Camada de acesso a dados (IStorage)
│   ├── db.ts                   # Conexão e pool do banco
│   ├── supabaseAuth.ts         # Middleware de autenticação
│   ├── openai.ts               # Geração de checklist IA
│   ├── devMode.ts              # Middleware de desenvolvimento
│   ├── vite.ts                 # Integração Vite no dev
│   ├── scheduleRoutes.ts       # Rotas do cronograma
│   ├── cronogramaRoutes.ts     # Rotas adicionais de cronograma
│   └── utils/                  # Utilitários do servidor
├── shared/                     # Código compartilhado client/server
│   ├── schema.ts               # Schema do banco (Drizzle) + tipos
│   └── types.ts                # Tipos compartilhados adicionais
├── docs/                       # Documentação estratégica
├── api/                        # Serverless functions (Vercel)
│   └── index.ts                # Entry point serverless
└── public/                     # Arquivos estáticos
    └── uploads/                # Uploads de usuários
```

## Padrões Obrigatórios

### 1. Schemas Compartilhados
Todo schema de validação **deve** ser definido em `shared/schema.ts` usando Drizzle + Zod.

### 2. Autenticação em Toda Rota Protegida
```typescript
app.get('/api/recurso', isAuthenticated, async (req: any, res) => {
  const userId = req.user.claims.sub;
  // ...
});
```

### 3. Verificação de Acesso ao Evento
```typescript
const event = await dbStorage.getEventById(eventId);
if (!event) return res.status(404).json({ message: "Event not found" });
if (event.ownerId !== userId) {
  const isTeamMember = await dbStorage.isUserTeamMember(userId, eventId);
  if (!isTeamMember) return res.status(403).json({ message: "Access denied" });
}
```

### 4. Activity Logging
Toda mutação importante deve gerar um activity log:
```typescript
await dbStorage.createActivityLog({
  eventId,
  userId,
  action: "ação_realizada",
  details: JSON.stringify({ /* dados relevantes */ })
});
```

### 5. Error Handling
```typescript
try {
  // operação
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: "Invalid data", errors: error.errors });
  }
  console.error("Contexto do erro:", error);
  res.status(500).json({ message: "Failed to ..." });
}
```

## Como Adicionar Novas Features

### 1. Nova Entidade no Banco
1. Adicionar tabela em `shared/schema.ts`.
2. Criar insert schema com `createInsertSchema()`.
3. Exportar types (`InsertX`, `X`).
4. Adicionar relações com `relations()`.
5. Executar `npm run db:push`.

### 2. Nova Rota de API
1. Adicionar rota dentro de `registerRoutes()` em `server/routes.ts` (ou criar módulo separado se > 200 linhas).
2. Usar `isAuthenticated` middleware.
3. Validar input com Zod schema.
4. Usar `dbStorage` para operações de banco.
5. Adicionar activity log.
6. Documentar em `API_CONTRACTS.md`.

### 3. Novo Método no Storage
1. Adicionar assinatura na interface `IStorage`.
2. Implementar em `DatabaseStorage`.
3. Considerar uso de cache (`MemoryCache`).

### 4. Nova Página no Frontend
1. Criar arquivo em `client/src/pages/NomeDaPagina.tsx`.
2. Importar em `App.tsx`.
3. Adicionar rota: `<Route path="/caminho" component={() => <ProtectedRoute component={NomeDaPagina} />} />`
4. Usar `useAuth()` para dados do usuário.
5. Usar TanStack Query para dados da API.

### 5. Novo Componente
1. Criar em `client/src/components/NomeDoComponente.tsx`.
2. Se for componente de UI genérico, usar `client/src/components/ui/`.
3. Usar Tailwind CSS para estilização.
4. Documentar props com TypeScript interface.

## O Que NÃO Deve Ser Feito

❌ **Nunca** acessar `db` diretamente nas rotas — sempre usar `dbStorage`.
❌ **Nunca** committar o `.env` no repositório.
❌ **Nunca** usar `console.log` com dados sensíveis (senhas, tokens completos) em produção.
❌ **Nunca** criar estado global (Redux, Zustand) sem aprovação — usar TanStack Query.
❌ **Nunca** usar CSS inline ou `style={}` — usar Tailwind classes.
❌ **Nunca** deixar uma rota de mutação (POST/PUT/DELETE) sem `isAuthenticated`.
❌ **Nunca** usar `db:push` em produção sem backup.
❌ **Nunca** aceitar upload sem validação de tipo de arquivo.
❌ **Nunca** retornar stack traces em respostas de API em produção.
❌ **Nunca** criar componentes com mais de 500 linhas — dividir em subcomponentes.

## Checklist de Pull Request

- [ ] Código compila sem erros (`npm run check`)
- [ ] Validação de input com Zod em toda rota nova
- [ ] Middleware `isAuthenticated` em toda rota protegida
- [ ] Verificação de acesso (owner/team member) quando aplicável
- [ ] Activity log para mutações importantes
- [ ] Resposta de erro com status code correto e mensagem descritiva
- [ ] Documentação atualizada (API_CONTRACTS.md, BUSINESS_RULES.md)
- [ ] Sem dados sensíveis em logs
- [ ] Componentes responsivos (testado em mobile)
- [ ] Sem `any` desnecessário no TypeScript
- [ ] Sem warnings no console do navegador
- [ ] Schema atualizado em `shared/schema.ts` se houve mudança no banco

---

*Última atualização: 12/02/2026*
