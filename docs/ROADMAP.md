# ROADMAP.md — Symera

## Features Planejadas

### 🎯 Curto Prazo (1-3 meses)

| Feature | Prioridade | Impacto | Complexidade |
|---------|------------|---------|-------------|
| Verificação de assinatura JWT | 🔴 Crítica | Segurança | Baixa |
| Migrar uploads para Supabase Storage | 🔴 Crítica | Confiabilidade | Média |
| Rate limiting na API | 🟠 Alta | Segurança | Baixa |
| CORS e security headers (Helmet) | 🟠 Alta | Segurança | Baixa |
| Notificações por email | 🟡 Média | Engajamento | Média |
| Exportar relatório de evento (PDF) | 🟡 Média | UX | Média |
| Filtros avançados no dashboard | 🟡 Média | UX | Baixa |
| Dark mode completo | 🟢 Baixa | UX | Baixa |

### 🚀 Médio Prazo (3-6 meses)

| Feature | Prioridade | Impacto | Complexidade |
|---------|------------|---------|-------------|
| Supabase Realtime (notificações em tempo real) | 🟠 Alta | Colaboração | Alta |
| Checklist IA com GPT (OpenAI real) | 🟡 Média | Diferencial | Média |
| Ambiente de staging | 🟡 Média | Qualidade | Média |
| Suíte de testes automatizados | 🟡 Média | Qualidade | Alta |
| Templates de evento reutilizáveis | 🟡 Média | Produtividade | Média |
| Integração com Google Calendar | 🟡 Média | UX | Média |
| PWA (Progressive Web App) | 🟡 Média | Acessibilidade | Média |
| Multi-idioma (i18n) | 🟢 Baixa | Mercado | Alta |

### 🔮 Longo Prazo (6-12 meses)

| Feature | Impacto | Complexidade |
|---------|---------|-------------|
| App mobile nativo (React Native) | Alto | Muito Alta |
| Marketplace de fornecedores | Alto | Muito Alta |
| Analytics e relatórios avançados | Alto | Alta |
| White-label para empresas | Alto | Muito Alta |
| Integração com sistemas de pagamento | Alto | Alta |
| IA generativa para descrições e convites | Médio | Média |
| Funcionalidade offline (sync) | Médio | Muito Alta |

## Dívida Técnica Identificada

### 🔴 Crítica

| Item | Arquivo | Descrição |
|------|---------|-----------|
| JWT sem verificação de assinatura | `supabaseAuth.ts` | Backend decodifica JWT mas não verifica assinatura |
| `routes.ts` com 3900+ linhas | `server/routes.ts` | Arquivo monolítico que deve ser dividido em módulos |
| Uploads em filesystem local | `server/routes.ts` | Incompatível com serverless; arquivos perdidos entre deploys |
| MemoryCache não distribuído | `server/storage.ts` | Cache in-process resetado a cada cold start na Vercel |
| Cookies não seguros | `supabaseAuth.ts` | `httpOnly: false`, `secure: false` mesmo em produção |

### 🟡 Média

| Item | Arquivo | Descrição |
|------|---------|-----------|
| `assigneeId` legado em `tasks` | `shared/schema.ts` | Campo legado; `task_assignees` é a tabela correta |
| Páginas duplicadas | `pages/` | `EventDetailNew.tsx` e `EventDetailRefactored.tsx` coexistem |
| `Team.tsx` e `Team.fixed.tsx` | `pages/` | Duas versões do mesmo componente |
| Plugins Replit no Vite | `vite.config.ts` | `@replit/vite-plugin-*` devem ser removidos |
| Dev mode auth middleware | `server/devMode.ts` | Middleware de dev pode interferir em testes |
| Sem índices explícitos em FKs | Schema Drizzle | PostgreSQL não cria índices automáticos para FKs |
| Console.logs com dados pessoais | Vários | User IDs e emails logados em produção |

### 🟢 Baixa

| Item | Descrição |
|------|-----------|
| Sem testes automatizados | Apenas `routes.test.ts` existe (mínimo) |
| Sem CHANGELOG | Mudanças não documentadas formalmente |
| Sem Prettier/ESLint configurado | Sem formatação automática |
| `package.json` name = `rest-express` | Nome herdado do template |

## Marcos Importantes

| Marco | Status | Data Esperada |
|-------|--------|--------------|
| ✅ MVP funcional | Completo | Jan 2026 |
| ✅ Migização para Supabase Auth | Completo | Jan 2026 |
| ✅ Deploy na Vercel | Completo | Fev 2026 |
| ⬜ Segurança hardened (JWT, CORS, Rate Limit) | Pendente | Mar 2026 |
| ⬜ Uploads em storage externo | Pendente | Mar 2026 |
| ⬜ Suíte de testes | Pendente | Abr 2026 |
| ⬜ Notificações e Realtime | Pendente | Mai 2026 |
| ⬜ PWA | Pendente | Jun 2026 |
| ⬜ V2.0 (templates, analytics) | Pendente | Set 2026 |

## Critérios de Priorização

Usamos a matriz **Impacto × Esforço** com bias para segurança:

```
              Alto Impacto
                  ▲
        FAÇA      |      PLANEJE
        AGORA     |      COM CUIDADO
   ───────────────┼───────────────►
        DELEGUE   |      NÃO FAÇA
        OU ADIE   |      AGORA
              Baixo Impacto
     Baixo Esforço         Alto Esforço
```

### Regras de Priorização
1. **Segurança** sempre vem primeiro, independente do esforço.
2. **Dívida técnica crítica** antes de features novas.
3. **Features com impacto em retenção** antes de features nice-to-have.
4. **Quick wins** (alto impacto, baixo esforço) são priorizados.
5. **Compatibilidade com serverless** deve ser considerada para toda decisão.

---

*Última atualização: 12/02/2026*
