# OBSERVABILITY.md — Symera

## Estado Atual da Observabilidade

O sistema possui observabilidade **básica** via console.log. Não há ferramentas externas de monitoramento ou APM configuradas.

## Logs Estruturados

### Implementado ✅

#### Middleware de Request Logging
Toda requisição `/api/*` é automaticamente logada com:
```
POST /api/events 201 in 45ms :: {"id":1,"name":"Evento Teste",...}
```
- Método HTTP, path, status code, duração em ms.
- Response body JSON (truncado em 80 caracteres).
- Implementado em `server/index.ts`.

#### Logs por Módulo (Prefixos)
| Prefixo | Módulo | Exemplos |
|---------|--------|----------|
| `[Auth]` | Autenticação | Login, resolução de ID, token refresh |
| `[Draft]` | Rascunhos | Salvar, buscar, deletar drafts |
| `[AI Checklist]` | Geração IA | Início, número de tarefas geradas, erros |
| `[Debug API]` | Rotas | Dados de atualização, uploads de imagem |
| `[useAuth]` | Frontend auth | Inicialização, sessão, token, dados do usuário |

#### Activity Logs (Banco de Dados)
Ações de negócio persistidas na tabela `activity_logs`:
- `created_event`, `updated_event`, `status_updated`
- `created_task`, `updated_task`
- `added_team_member`, `removed_team_member`
- Incluem `userId`, `eventId`, `details` (JSON).

### Não Implementado ⚠️
- Structured logging (JSON em vez de texto).
- Log levels (debug, info, warn, error).
- Correlação de logs (request ID).
- Log aggregation (CloudWatch, Datadog, etc.).
- Rotação de logs.

## Métricas Importantes

### Métricas Sugeridas para Monitoramento

#### Performance
| Métrica | Descrição | Alerta se |
|---------|-----------|-----------|
| `api.response_time` | Tempo de resposta da API | p95 > 2s |
| `api.error_rate` | Porcentagem de respostas 5xx | > 5% |
| `db.connection_pool.usage` | Conexões ativas no pool | > 8/10 |
| `db.query_time` | Duração das queries | p95 > 500ms |
| `auth.token_refresh_failures` | Falhas ao renovar token | > 10/hora |

#### Negócio
| Métrica | Descrição | Alerta se |
|---------|-----------|-----------|
| `events.created` | Eventos criados por dia | < 1/dia (inatividade) |
| `events.with_ai_checklist` | % de eventos com checklist IA | < 30% |
| `feedback.submissions` | Feedbacks recebidos por dia | — |
| `users.active_daily` | Usuários únicos por dia | < 5 |
| `uploads.size_total` | Volume total de uploads | > 1GB (risco filesystem) |

## Alertas Críticos

| Alerta | Condição | Ação |
|--------|----------|------|
| 🔴 **Database Down** | Todas as queries falhando | Verificar Supabase status, pool de conexões |
| 🔴 **Auth Service Down** | 100% de 401 responses | Verificar Supabase Auth status |
| 🟡 **Connection Pool Exhausted** | Pool usage = 10/10 | Restart servidor, investigar connection leaks |
| 🟡 **High Error Rate** | 5xx > 10% por 5 min | Investigar logs, verificar deploy recente |
| 🟡 **Slow Responses** | p95 > 5s por 10 min | Verificar queries lentas, cache hit rate |
| 🟢 **Cache Miss Rate** | > 80% por 1 hora | Verificar TTLs, padrões de acesso |

## Dashboards Necessários

### Dashboard: Visão Geral
- Requests por minuto.
- Error rate (4xx vs 5xx).
- Latência (p50, p95, p99).
- Usuários ativos.
- Eventos criados hoje.

### Dashboard: Database
- Conexões ativas no pool.
- Query duration distribution.
- Tables by row count.
- Cache hit rate (MemoryCache).

### Dashboard: Auth
- Logins por hora.
- Token refresh rate.
- Auth failures.
- Dev logins vs Google logins.

### Dashboard: Negócio
- Eventos por tipo.
- Tarefas completadas vs pendentes.
- Feedbacks recebidos.
- Volume de uploads.

## Estratégia de Tracing

### Atual
Não há distributed tracing implementado.

### Recomendação
1. **Adicionar request ID** a cada requisição (middleware):
```typescript
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
```

2. **Propagar request ID** nos logs:
```typescript
console.log(`[${req.id}] [Auth] Resolução de ID...`);
```

3. **Para tracing distribuído**, considerar:
   - **OpenTelemetry** — padrão aberto.
   - **Sentry** — error tracking + performance monitoring.
   - **Vercel Speed Insights** — já disponível gratuitamente.

## Plano de Implementação de Observabilidade

### Fase 1: Quick Wins (1-2 dias)
- [ ] Adicionar request ID a cada request.
- [ ] Padronizar log levels (info, warn, error).
- [ ] Adicionar log de 401/403 negados.
- [ ] Habilitar Vercel Analytics/Speed Insights.

### Fase 2: Structured Logging (3-5 dias)
- [ ] Migrar para logger estruturado (Winston ou Pino).
- [ ] Output JSON em produção.
- [ ] Integrar com Vercel Log Drain ou serviço externo.

### Fase 3: Monitoring (1 semana)
- [ ] Integrar Sentry para error tracking.
- [ ] Configurar alertas para erros críticos.
- [ ] Criar dashboards básicos.

### Fase 4: Full Observability (2+ semanas)
- [ ] OpenTelemetry para tracing.
- [ ] Métricas customizadas de negócio.
- [ ] Alertas proativos.
- [ ] Runbooks para cada alerta.

---

*Última atualização: 12/02/2026*
